from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, date
import json
from openai import OpenAI
from collections import defaultdict

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# NVIDIA API setup
NVIDIA_API_KEY = os.environ.get('NVIDIA_API_KEY', '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')
nvidia_client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=NVIDIA_API_KEY
)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ==================== MODELS ====================

class CauldronLevel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str
    cauldron_id: str
    level: float

class Ticket(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    ticket_id: str
    cauldron_id: str
    amount_collected: float
    courier_id: str
    date: str

class Discrepancy(BaseModel):
    cauldron_id: str
    date: str
    reported_amount: float
    expected_drain: float
    actual_level_change: float
    estimated_generation: float
    difference: float
    difference_percentage: float
    is_suspicious: bool
    tickets: List[Dict[str, Any]]

class AIAnalysisRequest(BaseModel):
    discrepancies: List[Discrepancy]

class AIAnalysisResponse(BaseModel):
    analysis: str
    suspicious_patterns: List[str]
    recommendations: List[str]
    actions_taken: List[Dict[str, Any]]
    fixed_count: int
    flagged_couriers: List[str]

class CauldronInfo(BaseModel):
    cauldron_id: str
    current_level: Optional[float] = None
    last_updated: Optional[str] = None
    total_tickets: int = 0
    total_collected: float = 0.0

class DailyStats(BaseModel):
    date: str
    total_tickets: int
    total_collected: float
    suspicious_count: int
    cauldrons_active: int


# ==================== HELPER FUNCTIONS ====================

async def load_data_into_db():
    """Load real_data.json and tickets.json into MongoDB"""
    try:
        # Check if data already loaded
        count = await db.cauldron_levels.count_documents({})
        if count > 0:
            logger.info("Data already loaded in database")
            return
        
        # Load real_data.json
        real_data_path = ROOT_DIR.parent / 'real_data.json'
        if real_data_path.exists():
            with open(real_data_path, 'r') as f:
                real_data = json.load(f)
            
            # Process and insert cauldron levels
            levels_to_insert = []
            for entry in real_data:
                timestamp = entry['timestamp']
                for cauldron_id, level in entry['cauldron_levels'].items():
                    levels_to_insert.append({
                        'id': str(uuid.uuid4()),
                        'timestamp': timestamp,
                        'cauldron_id': cauldron_id,
                        'level': level
                    })
            
            if levels_to_insert:
                await db.cauldron_levels.insert_many(levels_to_insert)
                logger.info(f"Loaded {len(levels_to_insert)} cauldron level records")
        
        # Load tickets.json
        tickets_path = ROOT_DIR.parent / 'tickets.json'
        if tickets_path.exists():
            with open(tickets_path, 'r') as f:
                tickets_data = json.load(f)
            
            tickets_to_insert = tickets_data.get('transport_tickets', [])
            if tickets_to_insert:
                await db.tickets.insert_many(tickets_to_insert)
                logger.info(f"Loaded {len(tickets_to_insert)} ticket records")
        
        # Create indexes for better query performance
        await db.cauldron_levels.create_index([("cauldron_id", 1), ("timestamp", 1)])
        await db.tickets.create_index([("cauldron_id", 1), ("date", 1)])
        
        logger.info("Data loading complete")
    except Exception as e:
        logger.error(f"Error loading data: {e}")


def calculate_discrepancies(levels_by_cauldron_date: Dict, tickets_by_cauldron_date: Dict) -> List[Discrepancy]:
    """Calculate discrepancies between reported tickets and actual drain"""
    discrepancies = []
    
    for (cauldron_id, date_str), tickets in tickets_by_cauldron_date.items():
        # Get levels for this cauldron on this date
        if (cauldron_id, date_str) not in levels_by_cauldron_date:
            continue
        
        levels = levels_by_cauldron_date[(cauldron_id, date_str)]
        if len(levels) < 2:
            continue
        
        # Calculate level change
        start_level = levels[0]['level']
        end_level = levels[-1]['level']
        level_change = end_level - start_level
        
        # Estimate generation rate (average increase during non-drain periods)
        # Find periods with continuous increase to estimate generation
        generation_rate = 0
        increases = []
        for i in range(1, len(levels)):
            diff = levels[i]['level'] - levels[i-1]['level']
            if diff > 0:
                increases.append(diff)
        
        if increases:
            # Average generation per minute
            avg_generation_per_min = sum(increases) / len(increases)
            # Total generation for the day (assuming 1440 minutes)
            estimated_generation = avg_generation_per_min * len(levels)
        else:
            estimated_generation = 0
        
        # Calculate expected drain (what was removed + what was generated)
        # If level decreased, drain = abs(decrease) + generation
        # If level increased, there might be no drain or small drain masked by generation
        if level_change < 0:
            # Net decrease observed, but there was generation happening
            actual_drain = abs(level_change) + estimated_generation
        else:
            # Net increase - drain might be less than generation
            actual_drain = max(0, estimated_generation - level_change)
        
        # Sum all reported amounts
        reported_amount = sum(t['amount_collected'] for t in tickets)
        
        # Calculate difference
        difference = reported_amount - actual_drain
        difference_percentage = (abs(difference) / actual_drain * 100) if actual_drain > 0 else 0
        
        # Flag as suspicious if difference > 5% or > 10 units
        is_suspicious = abs(difference) > 10 or difference_percentage > 5
        
        discrepancies.append(Discrepancy(
            cauldron_id=cauldron_id,
            date=date_str,
            reported_amount=round(reported_amount, 2),
            expected_drain=round(actual_drain, 2),
            actual_level_change=round(level_change, 2),
            estimated_generation=round(estimated_generation, 2),
            difference=round(difference, 2),
            difference_percentage=round(difference_percentage, 2),
            is_suspicious=is_suspicious,
            tickets=[
                {
                    'ticket_id': t['ticket_id'],
                    'courier_id': t['courier_id'],
                    'amount': t['amount_collected']
                } for t in tickets
            ]
        ))
    
    return discrepancies


async def analyze_with_ai(discrepancies: List[Discrepancy]) -> AIAnalysisResponse:
    """Use NVIDIA Nemotron Nano to analyze discrepancies and take corrective actions"""
    try:
        # Prepare data for AI
        suspicious = [d for d in discrepancies if d.is_suspicious]
        
        if not suspicious:
            return AIAnalysisResponse(
                analysis="No suspicious discrepancies detected. All ticket amounts match expected drain values within acceptable tolerance.",
                suspicious_patterns=[],
                recommendations=["Continue monitoring potion flow", "Maintain current verification procedures"],
                actions_taken=[],
                fixed_count=0,
                flagged_couriers=[]
            )
        
        # Create prompt
        prompt = f"""You are analyzing potion collection discrepancies at Poyo's Potion Factory.

Found {len(suspicious)} suspicious tickets out of {len(discrepancies)} total transactions.

Suspicious cases:
"""
        for d in suspicious[:10]:  # Limit to first 10 for context
            prompt += f"""
- {d.cauldron_id} on {d.date}:
  * Reported: {d.reported_amount}L
  * Expected: {d.expected_drain}L
  * Difference: {d.difference}L ({d.difference_percentage}%)
  * Couriers: {', '.join(set(t['courier_id'] for t in d.tickets))}
"""
        
        prompt += """
Analyze these discrepancies and provide:
1. Overall assessment of the situation
2. Any patterns you notice (specific couriers, cauldrons, dates)
3. Recommendations for Poyo to address this issue
"""
        
        # Call NVIDIA API
        completion = nvidia_client.chat.completions.create(
            model="nvidia/nvidia-nemotron-nano-9b-v2",
            messages=[
                {"role": "system", "content": "You are a potion factory audit assistant helping identify fraud and errors."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=1024,
            stream=False
        )
        
        analysis_text = completion.choices[0].message.content
        
        # Extract patterns
        courier_issues = defaultdict(int)
        cauldron_issues = defaultdict(int)
        for d in suspicious:
            cauldron_issues[d.cauldron_id] += 1
            for t in d.tickets:
                courier_issues[t['courier_id']] += 1
        
        patterns = []
        if courier_issues:
            top_courier = max(courier_issues.items(), key=lambda x: x[1])
            patterns.append(f"Courier {top_courier[0]} involved in {top_courier[1]} suspicious transactions")
        
        if cauldron_issues:
            top_cauldron = max(cauldron_issues.items(), key=lambda x: x[1])
            patterns.append(f"{top_cauldron[0]} has {top_cauldron[1]} suspicious tickets")
        
        # Generate recommendations
        recommendations = [
            "Implement real-time collection verification at point of drain",
            "Require multiple signatures for collections over threshold",
            "Install automated measurement systems on cauldrons"
        ]
        
        if courier_issues:
            worst_courier = max(courier_issues.items(), key=lambda x: x[1])[0]
            recommendations.append(f"Conduct audit of {worst_courier}'s recent collections")
        
        # ========== AGENTIC ACTIONS: AUTOMATICALLY FIX ISSUES ==========
        actions_taken = []
        fixed_count = 0
        flagged_couriers_set = set()
        
        # Action 1: Flag suspicious tickets in database
        for disc in suspicious:
            for ticket in disc.tickets:
                result = await db.tickets.update_one(
                    {"ticket_id": ticket['ticket_id']},
                    {
                        "$set": {
                            "flagged_suspicious": True,
                            "flagged_reason": f"Discrepancy: {disc.difference}L ({disc.difference_percentage}%)",
                            "ai_reviewed": True,
                            "review_timestamp": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                if result.modified_count > 0:
                    actions_taken.append({
                        "action": "flagged_ticket",
                        "ticket_id": ticket['ticket_id'],
                        "reason": f"Discrepancy: {disc.difference}L ({disc.difference_percentage}%)"
                    })
                    fixed_count += 1
        
        # Action 2: Flag problematic couriers (those involved in multiple suspicious tickets)
        for courier_id, count in courier_issues.items():
            if count >= 3:  # Flag couriers with 3+ suspicious tickets
                # Create or update courier flag in database
                await db.courier_flags.update_one(
                    {"courier_id": courier_id},
                    {
                        "$set": {
                            "courier_id": courier_id,
                            "flagged": True,
                            "suspicious_ticket_count": count,
                            "flag_timestamp": datetime.now(timezone.utc).isoformat(),
                            "status": "under_review",
                            "ai_flagged": True
                        }
                    },
                    upsert=True
                )
                flagged_couriers_set.add(courier_id)
                actions_taken.append({
                    "action": "flagged_courier",
                    "courier_id": courier_id,
                    "suspicious_count": count,
                    "status": "under_review"
                })
        
        # Action 3: Create corrected ticket records
        for disc in suspicious[:5]:  # Fix top 5 most egregious
            if abs(disc.difference_percentage) > 20:  # Only correct large discrepancies
                corrected_amount = disc.expected_drain
                correction_record = {
                    "correction_id": str(uuid.uuid4()),
                    "original_tickets": [t['ticket_id'] for t in disc.tickets],
                    "cauldron_id": disc.cauldron_id,
                    "date": disc.date,
                    "original_reported": disc.reported_amount,
                    "corrected_amount": corrected_amount,
                    "difference_corrected": disc.difference,
                    "ai_generated": True,
                    "correction_timestamp": datetime.now(timezone.utc).isoformat(),
                    "status": "pending_approval"
                }
                await db.ticket_corrections.insert_one(correction_record)
                actions_taken.append({
                    "action": "created_correction",
                    "cauldron_id": disc.cauldron_id,
                    "date": disc.date,
                    "original": disc.reported_amount,
                    "corrected": round(corrected_amount, 2)
                })
        
        # Action 4: Generate audit log
        audit_log = {
            "audit_id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "analysis_summary": analysis_text[:200],
            "suspicious_tickets_analyzed": len(suspicious),
            "actions_taken_count": len(actions_taken),
            "flagged_couriers": list(flagged_couriers_set),
            "ai_model": "nvidia/nvidia-nemotron-nano-9b-v2"
        }
        await db.audit_logs.insert_one(audit_log)
        
        logger.info(f"Agentic AI completed {len(actions_taken)} actions: {fixed_count} tickets flagged, {len(flagged_couriers_set)} couriers flagged")
        
        return AIAnalysisResponse(
            analysis=analysis_text,
            suspicious_patterns=patterns,
            recommendations=recommendations,
            actions_taken=actions_taken,
            fixed_count=fixed_count,
            flagged_couriers=list(flagged_couriers_set)
        )
    
    except Exception as e:
        logger.error(f"AI analysis error: {e}")
        return AIAnalysisResponse(
            analysis=f"AI analysis temporarily unavailable: {str(e)}",
            suspicious_patterns=["Multiple discrepancies detected - manual review recommended"],
            recommendations=["Review all flagged tickets manually", "Check courier logs"],
            actions_taken=[],
            fixed_count=0,
            flagged_couriers=[]
        )


# ==================== API ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "Potion Flow Monitoring API - Online"}


@api_router.get("/cauldrons", response_model=List[CauldronInfo])
async def get_cauldrons():
    """Get information about all cauldrons"""
    cauldrons_info = []
    
    for i in range(1, 13):
        cauldron_id = f"cauldron_{i:03d}"
        
        # Get latest level
        latest = await db.cauldron_levels.find_one(
            {"cauldron_id": cauldron_id},
            sort=[("timestamp", -1)]
        )
        
        # Get ticket stats
        tickets = await db.tickets.find({"cauldron_id": cauldron_id}).to_list(None)
        
        cauldrons_info.append(CauldronInfo(
            cauldron_id=cauldron_id,
            current_level=latest['level'] if latest else None,
            last_updated=latest['timestamp'] if latest else None,
            total_tickets=len(tickets),
            total_collected=sum(t['amount_collected'] for t in tickets)
        ))
    
    return cauldrons_info


@api_router.get("/levels")
async def get_levels(
    cauldron_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = Query(default=1000, le=10000)
):
    """Get cauldron levels with optional filters"""
    query = {}
    
    if cauldron_id:
        query["cauldron_id"] = cauldron_id
    
    if start_date:
        query.setdefault("timestamp", {})["$gte"] = start_date
    
    if end_date:
        query.setdefault("timestamp", {})["$lte"] = end_date
    
    levels = await db.cauldron_levels.find(query, {"_id": 0}).sort("timestamp", 1).limit(limit).to_list(None)
    
    return levels


@api_router.get("/tickets", response_model=List[Ticket])
async def get_tickets(
    cauldron_id: Optional[str] = None,
    courier_id: Optional[str] = None,
    date: Optional[str] = None
):
    """Get tickets with optional filters"""
    query = {}
    
    if cauldron_id:
        query["cauldron_id"] = cauldron_id
    
    if courier_id:
        query["courier_id"] = courier_id
    
    if date:
        query["date"] = date
    
    tickets = await db.tickets.find(query, {"_id": 0}).to_list(None)
    
    return tickets


@api_router.get("/discrepancies", response_model=List[Discrepancy])
async def get_discrepancies(
    suspicious_only: bool = False,
    cauldron_id: Optional[str] = None
):
    """Detect and return discrepancies between tickets and actual drain"""
    
    # Get all levels grouped by cauldron and date
    levels_cursor = db.cauldron_levels.find({}, {"_id": 0})
    levels_by_cauldron_date = defaultdict(list)
    
    async for level in levels_cursor:
        date_str = level['timestamp'][:10]  # Extract date from ISO timestamp
        key = (level['cauldron_id'], date_str)
        levels_by_cauldron_date[key].append(level)
    
    # Sort levels by timestamp for each group
    for key in levels_by_cauldron_date:
        levels_by_cauldron_date[key].sort(key=lambda x: x['timestamp'])
    
    # Get all tickets grouped by cauldron and date
    tickets_cursor = db.tickets.find({}, {"_id": 0})
    tickets_by_cauldron_date = defaultdict(list)
    
    async for ticket in tickets_cursor:
        key = (ticket['cauldron_id'], ticket['date'])
        tickets_by_cauldron_date[key].append(ticket)
    
    # Calculate discrepancies
    discrepancies = calculate_discrepancies(levels_by_cauldron_date, tickets_by_cauldron_date)
    
    # Filter if requested
    if suspicious_only:
        discrepancies = [d for d in discrepancies if d.is_suspicious]
    
    if cauldron_id:
        discrepancies = [d for d in discrepancies if d.cauldron_id == cauldron_id]
    
    return discrepancies


@api_router.post("/ai-analyze", response_model=AIAnalysisResponse)
async def ai_analyze_discrepancies(request: AIAnalysisRequest = None):
    """Use AI to analyze discrepancies and provide insights"""
    
    # If no discrepancies provided, fetch them
    if request is None or not hasattr(request, 'discrepancies') or not request.discrepancies:
        # Fetch discrepancies
        levels_cursor = db.cauldron_levels.find({}, {"_id": 0})
        levels_by_cauldron_date = defaultdict(list)
        
        async for level in levels_cursor:
            date_str = level['timestamp'][:10]
            key = (level['cauldron_id'], date_str)
            levels_by_cauldron_date[key].append(level)
        
        for key in levels_by_cauldron_date:
            levels_by_cauldron_date[key].sort(key=lambda x: x['timestamp'])
        
        tickets_cursor = db.tickets.find({}, {"_id": 0})
        tickets_by_cauldron_date = defaultdict(list)
        
        async for ticket in tickets_cursor:
            key = (ticket['cauldron_id'], ticket['date'])
            tickets_by_cauldron_date[key].append(ticket)
        
        discrepancies = calculate_discrepancies(levels_by_cauldron_date, tickets_by_cauldron_date)
    else:
        discrepancies = request.discrepancies
    
    # Analyze with AI
    analysis = await analyze_with_ai(discrepancies)
    
    return analysis


@api_router.get("/audit-logs")
async def get_audit_logs(limit: int = Query(default=10, le=100)):
    """Get AI audit logs showing actions taken"""
    logs = await db.audit_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(None)
    return logs


@api_router.get("/flagged-couriers")
async def get_flagged_couriers():
    """Get list of couriers flagged by AI"""
    couriers = await db.courier_flags.find({"flagged": True}, {"_id": 0}).to_list(None)
    return couriers


@api_router.get("/ticket-corrections")
async def get_ticket_corrections():
    """Get ticket corrections created by AI"""
    corrections = await db.ticket_corrections.find({}, {"_id": 0}).sort("correction_timestamp", -1).to_list(None)
    return corrections


@api_router.get("/stats/daily", response_model=List[DailyStats])
async def get_daily_stats():
    """Get daily statistics"""
    # Get all tickets grouped by date
    tickets = await db.tickets.find({}, {"_id": 0}).to_list(None)
    
    # Get discrepancies
    levels_cursor = db.cauldron_levels.find({}, {"_id": 0})
    levels_by_cauldron_date = defaultdict(list)
    
    async for level in levels_cursor:
        date_str = level['timestamp'][:10]
        key = (level['cauldron_id'], date_str)
        levels_by_cauldron_date[key].append(level)
    
    for key in levels_by_cauldron_date:
        levels_by_cauldron_date[key].sort(key=lambda x: x['timestamp'])
    
    tickets_by_cauldron_date = defaultdict(list)
    for ticket in tickets:
        key = (ticket['cauldron_id'], ticket['date'])
        tickets_by_cauldron_date[key].append(ticket)
    
    discrepancies = calculate_discrepancies(levels_by_cauldron_date, tickets_by_cauldron_date)
    
    # Group by date
    stats_by_date = defaultdict(lambda: {
        'total_tickets': 0,
        'total_collected': 0.0,
        'suspicious_count': 0,
        'cauldrons': set()
    })
    
    for ticket in tickets:
        date_str = ticket['date']
        stats_by_date[date_str]['total_tickets'] += 1
        stats_by_date[date_str]['total_collected'] += ticket['amount_collected']
        stats_by_date[date_str]['cauldrons'].add(ticket['cauldron_id'])
    
    for disc in discrepancies:
        if disc.is_suspicious:
            stats_by_date[disc.date]['suspicious_count'] += 1
    
    # Convert to list
    daily_stats = []
    for date_str, stats in sorted(stats_by_date.items()):
        daily_stats.append(DailyStats(
            date=date_str,
            total_tickets=stats['total_tickets'],
            total_collected=round(stats['total_collected'], 2),
            suspicious_count=stats['suspicious_count'],
            cauldrons_active=len(stats['cauldrons'])
        ))
    
    return daily_stats


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Load data on startup"""
    await load_data_into_db()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

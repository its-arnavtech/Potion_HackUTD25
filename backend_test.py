#!/usr/bin/env python3
"""
Backend API Test Suite for Potion Flow Monitoring System
Tests all API endpoints to verify functionality and data integrity
"""

import requests
import json
import sys
from typing import Dict, List, Any
import os
from pathlib import Path

# Load environment variables to get the backend URL
def load_frontend_env():
    """Load frontend .env file to get REACT_APP_BACKEND_URL"""
    env_path = Path(__file__).parent / 'frontend' / '.env'
    env_vars = {}
    
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key] = value.strip('"')
    
    return env_vars

# Get base URL from environment
env_vars = load_frontend_env()
BASE_URL = env_vars.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BASE_URL}/api"

class PotionAPITester:
    def __init__(self):
        self.results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        
    def log_result(self, test_name: str, success: bool, message: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"    {message}")
        
        if success:
            self.results['passed'] += 1
        else:
            self.results['failed'] += 1
            self.results['errors'].append(f"{test_name}: {message}")
    
    def test_health_check(self):
        """Test GET /api/ - Health check endpoint"""
        try:
            response = requests.get(f"{API_BASE}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                expected_message = "Potion Flow Monitoring API - Online"
                
                if data.get('message') == expected_message:
                    self.log_result("Health Check", True, f"API is online: {data['message']}")
                else:
                    self.log_result("Health Check", False, f"Unexpected message: {data.get('message')}")
            else:
                self.log_result("Health Check", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Health Check", False, f"Connection error: {str(e)}")
    
    def test_get_cauldrons(self):
        """Test GET /api/cauldrons - Get all cauldrons"""
        try:
            response = requests.get(f"{API_BASE}/cauldrons", timeout=10)
            
            if response.status_code == 200:
                cauldrons = response.json()
                
                # Check if we have 12 cauldrons
                if len(cauldrons) == 12:
                    self.log_result("Get Cauldrons - Count", True, f"Found {len(cauldrons)} cauldrons")
                else:
                    self.log_result("Get Cauldrons - Count", False, f"Expected 12 cauldrons, got {len(cauldrons)}")
                
                # Check cauldron structure and IDs
                expected_fields = ['cauldron_id', 'current_level', 'last_updated', 'total_tickets', 'total_collected']
                cauldron_ids = []
                
                for i, cauldron in enumerate(cauldrons):
                    cauldron_ids.append(cauldron.get('cauldron_id'))
                    
                    # Check required fields
                    missing_fields = [field for field in expected_fields if field not in cauldron]
                    if missing_fields:
                        self.log_result(f"Cauldron {i+1} Structure", False, f"Missing fields: {missing_fields}")
                    else:
                        self.log_result(f"Cauldron {i+1} Structure", True, f"All required fields present")
                
                # Check if cauldron IDs follow expected pattern (cauldron_001 to cauldron_012)
                expected_ids = [f"cauldron_{i:03d}" for i in range(1, 13)]
                if set(cauldron_ids) == set(expected_ids):
                    self.log_result("Cauldron IDs", True, "All expected cauldron IDs present")
                else:
                    missing = set(expected_ids) - set(cauldron_ids)
                    extra = set(cauldron_ids) - set(expected_ids)
                    self.log_result("Cauldron IDs", False, f"Missing: {missing}, Extra: {extra}")
                    
            else:
                self.log_result("Get Cauldrons", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Get Cauldrons", False, f"Error: {str(e)}")
    
    def test_get_levels(self):
        """Test GET /api/levels with cauldron_id and limit parameters"""
        try:
            # Test with specific cauldron and limit
            params = {'cauldron_id': 'cauldron_008', 'limit': 100}
            response = requests.get(f"{API_BASE}/levels", params=params, timeout=10)
            
            if response.status_code == 200:
                levels = response.json()
                
                if isinstance(levels, list):
                    self.log_result("Get Levels - Response Type", True, f"Returned list with {len(levels)} records")
                    
                    if levels:
                        # Check structure of first level record
                        expected_fields = ['timestamp', 'cauldron_id', 'level']
                        first_level = levels[0]
                        
                        missing_fields = [field for field in expected_fields if field not in first_level]
                        if missing_fields:
                            self.log_result("Level Record Structure", False, f"Missing fields: {missing_fields}")
                        else:
                            self.log_result("Level Record Structure", True, "All required fields present")
                        
                        # Check if all records are for cauldron_008
                        wrong_cauldron = [l for l in levels if l.get('cauldron_id') != 'cauldron_008']
                        if wrong_cauldron:
                            self.log_result("Level Filtering", False, f"Found {len(wrong_cauldron)} records for wrong cauldron")
                        else:
                            self.log_result("Level Filtering", True, "All records are for cauldron_008")
                    else:
                        self.log_result("Get Levels - Data", False, "No level data returned")
                else:
                    self.log_result("Get Levels - Response Type", False, f"Expected list, got {type(levels)}")
            else:
                self.log_result("Get Levels", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Get Levels", False, f"Error: {str(e)}")
    
    def test_get_tickets(self):
        """Test GET /api/tickets - Get all tickets and filtered tickets"""
        try:
            # Test getting all tickets
            response = requests.get(f"{API_BASE}/tickets", timeout=10)
            
            if response.status_code == 200:
                all_tickets = response.json()
                
                if isinstance(all_tickets, list):
                    self.log_result("Get All Tickets - Type", True, f"Returned list with {len(all_tickets)} tickets")
                    
                    # Check if we have expected number of tickets (149)
                    if len(all_tickets) == 149:
                        self.log_result("Get All Tickets - Count", True, "Found expected 149 tickets")
                    else:
                        self.log_result("Get All Tickets - Count", False, f"Expected 149 tickets, got {len(all_tickets)}")
                    
                    if all_tickets:
                        # Check structure
                        expected_fields = ['ticket_id', 'cauldron_id', 'amount_collected', 'courier_id', 'date']
                        first_ticket = all_tickets[0]
                        
                        missing_fields = [field for field in expected_fields if field not in first_ticket]
                        if missing_fields:
                            self.log_result("Ticket Structure", False, f"Missing fields: {missing_fields}")
                        else:
                            self.log_result("Ticket Structure", True, "All required fields present")
                else:
                    self.log_result("Get All Tickets - Type", False, f"Expected list, got {type(all_tickets)}")
                
                # Test filtering by cauldron_id
                params = {'cauldron_id': 'cauldron_008'}
                response = requests.get(f"{API_BASE}/tickets", params=params, timeout=10)
                
                if response.status_code == 200:
                    filtered_tickets = response.json()
                    
                    if isinstance(filtered_tickets, list):
                        # Check if all tickets are for cauldron_008
                        wrong_cauldron = [t for t in filtered_tickets if t.get('cauldron_id') != 'cauldron_008']
                        if wrong_cauldron:
                            self.log_result("Ticket Filtering", False, f"Found {len(wrong_cauldron)} tickets for wrong cauldron")
                        else:
                            self.log_result("Ticket Filtering", True, f"All {len(filtered_tickets)} tickets are for cauldron_008")
                    else:
                        self.log_result("Ticket Filtering", False, f"Expected list, got {type(filtered_tickets)}")
                else:
                    self.log_result("Ticket Filtering", False, f"HTTP {response.status_code}")
            else:
                self.log_result("Get Tickets", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Get Tickets", False, f"Error: {str(e)}")
    
    def test_get_discrepancies(self):
        """Test GET /api/discrepancies - Get all and suspicious discrepancies"""
        try:
            # Test getting all discrepancies
            response = requests.get(f"{API_BASE}/discrepancies", timeout=15)
            
            if response.status_code == 200:
                all_discrepancies = response.json()
                
                if isinstance(all_discrepancies, list):
                    self.log_result("Get All Discrepancies - Type", True, f"Returned list with {len(all_discrepancies)} discrepancies")
                    
                    if all_discrepancies:
                        # Check structure
                        expected_fields = ['cauldron_id', 'date', 'reported_amount', 'expected_drain', 'difference', 'is_suspicious']
                        first_disc = all_discrepancies[0]
                        
                        missing_fields = [field for field in expected_fields if field not in first_disc]
                        if missing_fields:
                            self.log_result("Discrepancy Structure", False, f"Missing fields: {missing_fields}")
                        else:
                            self.log_result("Discrepancy Structure", True, "All required fields present")
                else:
                    self.log_result("Get All Discrepancies - Type", False, f"Expected list, got {type(all_discrepancies)}")
                
                # Test filtering for suspicious only
                params = {'suspicious_only': 'true'}
                response = requests.get(f"{API_BASE}/discrepancies", params=params, timeout=15)
                
                if response.status_code == 200:
                    suspicious_discrepancies = response.json()
                    
                    if isinstance(suspicious_discrepancies, list):
                        # Check if all returned discrepancies are suspicious
                        non_suspicious = [d for d in suspicious_discrepancies if not d.get('is_suspicious')]
                        if non_suspicious:
                            self.log_result("Suspicious Filtering", False, f"Found {len(non_suspicious)} non-suspicious in filtered results")
                        else:
                            self.log_result("Suspicious Filtering", True, f"All {len(suspicious_discrepancies)} discrepancies are suspicious")
                        
                        # Check if we have approximately 76 suspicious tickets
                        if 70 <= len(suspicious_discrepancies) <= 80:
                            self.log_result("Suspicious Count", True, f"Found {len(suspicious_discrepancies)} suspicious discrepancies (expected ~76)")
                        else:
                            self.log_result("Suspicious Count", False, f"Expected ~76 suspicious discrepancies, got {len(suspicious_discrepancies)}")
                    else:
                        self.log_result("Suspicious Filtering", False, f"Expected list, got {type(suspicious_discrepancies)}")
                else:
                    self.log_result("Suspicious Filtering", False, f"HTTP {response.status_code}")
            else:
                self.log_result("Get Discrepancies", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Get Discrepancies", False, f"Error: {str(e)}")
    
    def test_get_daily_stats(self):
        """Test GET /api/stats/daily - Get daily statistics"""
        try:
            response = requests.get(f"{API_BASE}/stats/daily", timeout=15)
            
            if response.status_code == 200:
                daily_stats = response.json()
                
                if isinstance(daily_stats, list):
                    self.log_result("Get Daily Stats - Type", True, f"Returned list with {len(daily_stats)} daily records")
                    
                    if daily_stats:
                        # Check structure
                        expected_fields = ['date', 'total_tickets', 'total_collected', 'suspicious_count', 'cauldrons_active']
                        first_stat = daily_stats[0]
                        
                        missing_fields = [field for field in expected_fields if field not in first_stat]
                        if missing_fields:
                            self.log_result("Daily Stats Structure", False, f"Missing fields: {missing_fields}")
                        else:
                            self.log_result("Daily Stats Structure", True, "All required fields present")
                        
                        # Check data types
                        if (isinstance(first_stat.get('total_tickets'), int) and
                            isinstance(first_stat.get('total_collected'), (int, float)) and
                            isinstance(first_stat.get('suspicious_count'), int) and
                            isinstance(first_stat.get('cauldrons_active'), int)):
                            self.log_result("Daily Stats Data Types", True, "All numeric fields have correct types")
                        else:
                            self.log_result("Daily Stats Data Types", False, "Some numeric fields have incorrect types")
                    else:
                        self.log_result("Get Daily Stats - Data", False, "No daily stats data returned")
                else:
                    self.log_result("Get Daily Stats - Type", False, f"Expected list, got {type(daily_stats)}")
            else:
                self.log_result("Get Daily Stats", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Get Daily Stats", False, f"Error: {str(e)}")
    
    def test_ai_analyze(self):
        """Test POST /api/ai-analyze - AI analysis endpoint"""
        try:
            # Test with no body (should fetch discrepancies automatically)
            response = requests.post(f"{API_BASE}/ai-analyze", timeout=30)
            
            if response.status_code == 200:
                analysis = response.json()
                
                # Check structure
                expected_fields = ['analysis', 'suspicious_patterns', 'recommendations']
                missing_fields = [field for field in expected_fields if field not in analysis]
                
                if missing_fields:
                    self.log_result("AI Analysis Structure", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_result("AI Analysis Structure", True, "All required fields present")
                
                # Check data types
                if (isinstance(analysis.get('analysis'), str) and
                    isinstance(analysis.get('suspicious_patterns'), list) and
                    isinstance(analysis.get('recommendations'), list)):
                    self.log_result("AI Analysis Data Types", True, "All fields have correct types")
                else:
                    self.log_result("AI Analysis Data Types", False, "Some fields have incorrect types")
                
                # Check if analysis contains meaningful content
                analysis_text = analysis.get('analysis', '')
                if len(analysis_text) > 50:  # Reasonable length for analysis
                    self.log_result("AI Analysis Content", True, f"Analysis contains {len(analysis_text)} characters")
                else:
                    self.log_result("AI Analysis Content", False, f"Analysis too short: {len(analysis_text)} characters")
                    
            else:
                self.log_result("AI Analysis", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("AI Analysis", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all API tests"""
        print(f"🧪 Starting Potion Flow Monitoring API Tests")
        print(f"📍 Base URL: {API_BASE}")
        print("=" * 60)
        
        # Run all tests
        self.test_health_check()
        print()
        
        self.test_get_cauldrons()
        print()
        
        self.test_get_levels()
        print()
        
        self.test_get_tickets()
        print()
        
        self.test_get_discrepancies()
        print()
        
        self.test_get_daily_stats()
        print()
        
        self.test_ai_analyze()
        print()
        
        # Print summary
        print("=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📈 Success Rate: {self.results['passed']/(self.results['passed']+self.results['failed'])*100:.1f}%")
        
        if self.results['errors']:
            print(f"\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        return self.results['failed'] == 0

if __name__ == "__main__":
    tester = PotionAPITester()
    success = tester.run_all_tests()
    
    if not success:
        sys.exit(1)
    else:
        print(f"\n🎉 All tests passed! API is working correctly.")
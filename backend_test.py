import requests
import sys
import json
from datetime import datetime

class CredEatAPITester:
    def __init__(self, base_url="https://campusbites-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.student_token = None
        self.admin_token = None
        self.vendor_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.student_id = None
        self.meal_ids = []

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_student_registration(self):
        """Test student registration"""
        student_data = {
            "email": "student@test.com",
            "password": "pass123",
            "full_name": "Test Student",
            "role": "student"
        }
        success, response = self.run_test(
            "Student Registration",
            "POST",
            "auth/register",
            200,
            data=student_data
        )
        if success and 'id' in response:
            self.student_id = response['id']
        return success

    def test_student_login(self):
        """Test student login"""
        # OAuth2PasswordRequestForm expects form data
        url = f"{self.base_url}/api/auth/login"
        data = {
            "username": "student@test.com",
            "password": "pass123"
        }
        
        self.tests_run += 1
        print(f"\n🔍 Testing Student Login...")
        print(f"   URL: {url}")
        
        try:
            response = requests.post(url, data=data)  # Use data instead of json
            success = response.status_code == 200
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                response_json = response.json()
                if 'access_token' in response_json:
                    self.student_token = response_json['access_token']
                return True
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False

    def test_admin_login(self):
        """Test admin login"""
        url = f"{self.base_url}/api/auth/login"
        data = {
            "username": "admin@credeat.com",
            "password": "admin123"
        }
        
        self.tests_run += 1
        print(f"\n🔍 Testing Admin Login...")
        print(f"   URL: {url}")
        
        try:
            response = requests.post(url, data=data)
            success = response.status_code == 200
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                response_json = response.json()
                if 'access_token' in response_json:
                    self.admin_token = response_json['access_token']
                return True
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False

    def test_vendor_login(self):
        """Test vendor login"""
        url = f"{self.base_url}/api/auth/login"
        data = {
            "username": "vendor@credeat.com",
            "password": "vendor123"
        }
        
        self.tests_run += 1
        print(f"\n🔍 Testing Vendor Login...")
        print(f"   URL: {url}")
        
        try:
            response = requests.post(url, data=data)
            success = response.status_code == 200
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                response_json = response.json()
                if 'access_token' in response_json:
                    self.vendor_token = response_json['access_token']
                return True
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False

    def test_get_meals(self):
        """Test getting meals"""
        success, response = self.run_test(
            "Get Meals",
            "GET",
            "meals/",
            200,
            token=self.student_token
        )
        if success and isinstance(response, list) and len(response) > 0:
            self.meal_ids = [meal['id'] for meal in response]
            print(f"   Found {len(self.meal_ids)} meals")
        return success

    def test_skip_meal(self):
        """Test skipping a meal"""
        if not self.meal_ids:
            print("❌ No meals available to skip")
            return False
            
        # The API expects /meals/{meal_id}/select with status as query param or body
        url = f"{self.base_url}/api/meals/{self.meal_ids[0]}/select"
        headers = {'Content-Type': 'application/json'}
        if self.student_token:
            headers['Authorization'] = f'Bearer {self.student_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing Skip Meal...")
        print(f"   URL: {url}")
        
        try:
            # Try with query parameter
            response = requests.post(f"{url}?status=skipped", headers=headers)
            success = response.status_code == 200
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                return True
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False

    def test_attend_meal(self):
        """Test attending a meal"""
        if len(self.meal_ids) < 2:
            print("❌ Not enough meals to test attending")
            return False
            
        url = f"{self.base_url}/api/meals/{self.meal_ids[1]}/select"
        headers = {'Content-Type': 'application/json'}
        if self.student_token:
            headers['Authorization'] = f'Bearer {self.student_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing Attend Meal...")
        print(f"   URL: {url}")
        
        try:
            response = requests.post(f"{url}?status=attending", headers=headers)
            success = response.status_code == 200
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                return True
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False

    def test_get_wallet_balance(self):
        """Test getting wallet balance"""
        return self.run_test(
            "Get Wallet Balance",
            "GET",
            "wallet/",
            200,
            token=self.student_token
        )[0]

    def test_get_transactions(self):
        """Test getting transaction history"""
        # This is included in the wallet endpoint
        return True  # Skip separate test since it's part of wallet

    def test_submit_complaint(self):
        """Test submitting a complaint"""
        complaint_data = {
            "category": "quality",
            "description": "Test complaint - food quality issue"
        }
        return self.run_test(
            "Submit Complaint",
            "POST",
            "complaints/",
            201,
            data=complaint_data,
            token=self.student_token
        )[0]

    def test_get_complaints_admin(self):
        """Test getting complaints as admin"""
        return self.run_test(
            "Get Complaints (Admin)",
            "GET",
            "complaints/",
            200,
            token=self.admin_token
        )[0]

    def test_analytics_dashboard(self):
        """Test analytics dashboard"""
        return self.run_test(
            "Analytics Dashboard",
            "GET",
            "analytics/wastage",
            200,
            token=self.admin_token
        )[0]

def main():
    print("🚀 Starting CredEat API Testing...")
    tester = CredEatAPITester()

    # Test sequence
    tests = [
        ("Root API", tester.test_root_endpoint),
        ("Student Registration", tester.test_student_registration),
        ("Student Login", tester.test_student_login),
        ("Admin Login", tester.test_admin_login),
        ("Vendor Login", tester.test_vendor_login),
        ("Get Meals", tester.test_get_meals),
        ("Skip Meal", tester.test_skip_meal),
        ("Attend Meal", tester.test_attend_meal),
        ("Get Wallet Balance", tester.test_get_wallet_balance),
        ("Get Transactions", tester.test_get_transactions),
        ("Submit Complaint", tester.test_submit_complaint),
        ("Get Complaints (Admin)", tester.test_get_complaints_admin),
        ("Analytics Dashboard", tester.test_analytics_dashboard),
    ]

    failed_tests = []
    for test_name, test_func in tests:
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
            failed_tests.append(test_name)

    # Print results
    print(f"\n📊 Test Results:")
    print(f"   Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"   Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed tests: {', '.join(failed_tests)}")
        return 1
    else:
        print(f"\n✅ All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())
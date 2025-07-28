#!/usr/bin/env python3
"""
Test script to verify dashboard calculations are working correctly.
"""

import requests
import json

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_USERNAME = "testuser"
TEST_PASSWORD = "testpass123"

def test_dashboard_calculations():
    """Test the dashboard calculations."""
    
    print("Testing Dashboard Calculations...")
    print("=" * 50)
    
    # Step 1: Login to get token
    print("1. Logging in...")
    login_data = {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD
    }
    
    try:
        login_response = requests.post(f"{BASE_URL}/login", data=login_data)
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return
        
        login_data = login_response.json()
        token = login_data["token"]
        user_id = login_data["user"]["id"]
        print(f"✅ Login successful. User ID: {user_id}")
        print(f"✅ User name: {login_data['user']['name']}")
        
    except Exception as e:
        print(f"❌ Login request failed: {e}")
        return
    
    # Step 2: Get dashboard data
    print("\n2. Getting dashboard data...")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        dashboard_response = requests.get(f"{BASE_URL}/dashboard/{user_id}", headers=headers)
        if dashboard_response.status_code != 200:
            print(f"❌ Dashboard request failed: {dashboard_response.text}")
            return
        
        dashboard_data = dashboard_response.json()
        summary = dashboard_data["summary"]
        
        print("✅ Dashboard data retrieved successfully!")
        print(f"   Monthly Income: ₹{summary['monthly_income']:,.2f}")
        print(f"   Monthly Expenses: ₹{summary['monthly_expenses']:,.2f}")
        print(f"   Total Balance: ₹{summary['total_balance']:,.2f}")
        print(f"   Current Savings: ₹{summary['current_savings']:,.2f}")
        print(f"   Savings Goal: ₹{summary['savings_goal']:,.2f}")
        
        # Verify the calculation
        calculated_balance = summary['monthly_income'] - summary['monthly_expenses']
        print(f"\n   Calculated Balance (Income - Expenses): ₹{calculated_balance:,.2f}")
        
        if abs(summary['total_balance'] - calculated_balance) < 0.01:
            print("✅ Total Balance calculation is correct!")
        else:
            print("❌ Total Balance calculation is incorrect!")
            print(f"   Expected: ₹{calculated_balance:,.2f}")
            print(f"   Actual: ₹{summary['total_balance']:,.2f}")
        
        # Check percentage changes
        if summary['last_month_income'] > 0:
            income_change = ((summary['monthly_income'] - summary['last_month_income']) / summary['last_month_income']) * 100
            print(f"\n   Income change: {income_change:+.1f}%")
        
        if summary['last_month_expenses'] > 0:
            expense_change = ((summary['monthly_expenses'] - summary['last_month_expenses']) / summary['last_month_expenses']) * 100
            print(f"   Expense change: {expense_change:+.1f}%")
        
        if summary['last_month_balance'] > 0:
            balance_change = ((summary['total_balance'] - summary['last_month_balance']) / summary['last_month_balance']) * 100
            print(f"   Balance change: {balance_change:+.1f}%")
        
    except Exception as e:
        print(f"❌ Dashboard request failed: {e}")
        return
    
    print("\n" + "=" * 50)
    print("Test completed!")

if __name__ == "__main__":
    test_dashboard_calculations() 
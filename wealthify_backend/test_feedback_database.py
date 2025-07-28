import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/wealthify")

def test_feedback_database():
    engine = create_engine(DATABASE_URL)
    try:
        with engine.connect() as conn:
            # Check if feedback table exists
            print("=== CHECKING FEEDBACK TABLE ===")
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name = 'feedback'
            """))
            if result.fetchone():
                print("✅ Feedback table exists!")
            else:
                print("❌ Feedback table does not exist!")
                return False
            
            # Check feedback table structure
            print("\n=== FEEDBACK TABLE STRUCTURE ===")
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'feedback'
                ORDER BY ordinal_position
            """))
            columns = result.fetchall()
            for col in columns:
                print(f"Column: {col[0]}, Type: {col[1]}, Nullable: {col[2]}")
            
            # Check existing feedback data
            print("\n=== EXISTING FEEDBACK DATA ===")
            result = conn.execute(text("SELECT * FROM feedback ORDER BY created_at DESC LIMIT 5"))
            rows = result.fetchall()
            if rows:
                print(f"Found {len(rows)} feedback records:")
                for row in rows:
                    print(f"ID: {row[0]}, User ID: {row[1]}, Message: {row[2][:50]}..., Created: {row[3]}")
            else:
                print("No feedback data found!")
            
            # Test inserting a feedback record
            print("\n=== TESTING FEEDBACK INSERTION ===")
            test_user_id = 1  # Assuming user ID 1 exists
            test_message = "Test feedback from database script"
            
            # Check if user exists
            user_result = conn.execute(text("SELECT id FROM users WHERE id = :user_id"), {"user_id": test_user_id})
            if not user_result.fetchone():
                print(f"❌ User ID {test_user_id} does not exist!")
                return False
            
            # Insert test feedback
            conn.execute(text("""
                INSERT INTO feedback (user_id, message, created_at) 
                VALUES (:user_id, :message, NOW())
            """), {
                "user_id": test_user_id,
                "message": test_message
            })
            conn.commit()
            print("✅ Test feedback inserted successfully!")
            
            # Verify the insertion
            result = conn.execute(text("""
                SELECT * FROM feedback 
                WHERE user_id = :user_id AND message = :message
                ORDER BY created_at DESC LIMIT 1
            """), {
                "user_id": test_user_id,
                "message": test_message
            })
            row = result.fetchone()
            if row:
                print(f"✅ Verified: Feedback ID {row[0]} created for user {row[1]}")
            else:
                print("❌ Could not verify feedback insertion!")
            
            return True
            
    except Exception as e:
        print(f"❌ Error testing feedback database: {e}")
        return False

if __name__ == "__main__":
    print("Testing feedback database functionality...")
    success = test_feedback_database()
    if success:
        print("\n✅ Feedback database test completed successfully!")
    else:
        print("\n❌ Feedback database test failed!")
        sys.exit(1) 
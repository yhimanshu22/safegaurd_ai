import httpx
import time
import random

API_BASE = "http://localhost:8000"

# Sample content for diverse testing
SAFE_POSTS = [
    "Hello everyone! This is a great community.",
    "The weather is beautiful today.",
    "Just finished a great workout!",
    "Does anyone have a good recipe for pasta?",
    "I'm learning React and it's so fun!",
    "Looking forward to the weekend.",
    "Best book you've read recently?",
    "I love the design of this dashboard.",
    "Good morning world!",
    "What's your favorite coding language?"
]

TOXIC_POSTS = [
    "You are so stupid and I hate you.",
    "idiot, stop posting this trash.",
    "I'm going to find you and hurt you.",
    "Everyone here is a loser.",
    "Shut up and go away forever."
]

BOUNDARY_POSTS = [
    "I think your opinion is wrong and you should reconsider.",
    "Stop being so annoying with your posts.",
    "This is arguably the worst take I've seen today.",
    "Politics these days is just a mess, everyone is corrupt.",
    "Why do people keep posting such low-quality content?"
]

AD_SPAM_POSTS = [
    "CLICK HERE FOR FREE BITCOIN! DON'T MISS OUT!",
    "Low price insurance deals starting at $1 per day.",
    "Follow for follow! I follow back instantly.",
    "Check out my profile for exclusive deals on shoes."
]

def run_stress_test(count=50):
    print(f"🚀 Starting stress test with {count} posts using httpx...")
    
    with httpx.Client(base_url=API_BASE, timeout=10.0) as client:
        for i in range(count):
            username = f"tester_{i}_{random.randint(1000, 9999)}"
            password = "Pass123!"
            
            try:
                # 1. Register User
                reg_res = client.post("/register", json={
                    "username": username,
                    "password": password,
                    "role": "user"
                })
                if reg_res.status_code != 200:
                    print(f"❌ Failed to register {username}: {reg_res.text}")
                    continue
                    
                # 2. Login
                auth_res = client.post("/login", json={
                    "username": username,
                    "password": password
                })
                token = auth_res.json().get("access_token")
                
                # 3. Select Content
                pool = random.choices([SAFE_POSTS, TOXIC_POSTS, BOUNDARY_POSTS, AD_SPAM_POSTS], weights=[60, 15, 15, 10])[0]
                content = random.choice(pool)
                
                # 4. Post
                post_res = client.post("/posts", json={
                    "content": content,
                    "image_url": None
                }, headers={"Authorization": f"Bearer {token}"})
                
                if post_res.status_code == 200:
                    print(f"✅ [{i+1}/{count}] {username}: {content[:30]}...")
                else:
                    print(f"⚠️ [{i+1}/{count}] Failed to post: {post_res.text}")
                    
                # Small delay to avoid hammering the machine
                time.sleep(0.5)
                
            except Exception as e:
                print(f"💥 Error at index {i}: {e}")

if __name__ == "__main__":
    run_stress_test(50)

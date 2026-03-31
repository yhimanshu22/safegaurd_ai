import httpx
import json

try:
    res = httpx.get('http://localhost:8000/posts')
    data = res.json()
    print(f"Status Code: {res.status_code}")
    print(f"Total Posts: {len(data)}")
    if data:
        print("\nLatest 3 Posts:")
        for p in data[:3]:
            print(f"- ID {p.get('id')}: by @{p.get('username')} | Status: {p.get('status')} | Content: {p.get('content')[:30]}...")
except Exception as e:
    print(f"Error: {e}")

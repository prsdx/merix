import httpx
import time
import uuid

async def test_live_journey():
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. Health check
        res = await client.get("http://localhost:8000/health")
        print(f"1. Health check status: {res.status_code}, data: {res.json()}")
        assert res.status_code == 200

        # 2. Org Signup
        org_name = f"Apex Placement Cell {uuid.uuid4().hex[:6]}"
        email = f"admin_{uuid.uuid4().hex[:6]}@apexplacement.in"
        password = "SecurePassword123!"
        
        signup_res = await client.post("http://localhost:8000/api/auth/signup", json={
            "org_name": org_name,
            "email": email,
            "password": password
        })
        print(f"2. Signup status: {signup_res.status_code}")
        assert signup_res.status_code == 201
        token = signup_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Auth Me
        me_res = await client.get("http://localhost:8000/api/auth/me", headers=headers)
        print(f"3. Auth /me status: {me_res.status_code}, org: {me_res.json()['org_name']}, email: {me_res.json()['email']}")
        assert me_res.status_code == 200

        # 4. List Jobs (empty state)
        jobs_res = await client.get("http://localhost:8000/api/jobs", headers=headers)
        print(f"4. Initial jobs count: {len(jobs_res.json())}")
        assert jobs_res.status_code == 200

        # 5. Create Job (Post a Job)
        job_create_res = await client.post("http://localhost:8000/api/jobs", headers=headers, json={
            "title": "Senior Distributed Systems Engineer (Go / Python)",
            "raw_text": "We need a Senior Distributed Systems Engineer. Requirements: Python, FastAPI, PostgreSQL, Vector Databases, Docker. 3+ years experience required."
        })
        print(f"5. Create job status: {job_create_res.status_code}, id: {job_create_res.json()['id']}")
        assert job_create_res.status_code == 201
        job_id = job_create_res.json()["id"]

        # 6. List Jobs (populated state)
        jobs_after = await client.get("http://localhost:8000/api/jobs", headers=headers)
        print(f"6. Populated jobs count: {len(jobs_after.json())}, title: {jobs_after.json()[0]['title']}")
        assert len(jobs_after.json()) == 1

        # 7. Org Settings & Retention
        org_res = await client.get("http://localhost:8000/api/orgs/me", headers=headers)
        print(f"7. Org retention days: {org_res.json()['retention_days']}")
        assert org_res.status_code == 200

        update_org_res = await client.patch("http://localhost:8000/api/orgs/me", headers=headers, json={
            "retention_days": 120
        })
        print(f"   Updated retention days: {update_org_res.json()['retention_days']}")
        assert update_org_res.json()["retention_days"] == 120

        # 8. Audit Logs
        audit_res = await client.get("http://localhost:8000/api/orgs/audit-logs", headers=headers)
        print(f"8. Audit logs status: {audit_res.status_code}, count: {len(audit_res.json())}")
        assert audit_res.status_code == 200

        # 9. Frontend HTTP Reachability
        frontend_res = await client.get("http://localhost:3000/")
        print(f"9. Frontend / (Landing page) status: {frontend_res.status_code}")
        assert frontend_res.status_code == 200

        login_page_res = await client.get("http://localhost:3000/login")
        print(f"10. Frontend /login status: {login_page_res.status_code}")
        assert login_page_res.status_code == 200

        dashboard_page_res = await client.get("http://localhost:3000/dashboard")
        print(f"11. Frontend /dashboard status: {dashboard_page_res.status_code}")
        assert dashboard_page_res.status_code == 200

        print("\n========================================================")
        print("ALL 11 REAL BACKEND + FRONTEND SCREENS VERIFIED PASSING!")
        print("========================================================")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_live_journey())

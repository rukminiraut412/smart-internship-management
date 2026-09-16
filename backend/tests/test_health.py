"""Tests for the health check and root endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check_status_code():
    """Verify that GET /api/health returns HTTP 200 OK."""
    response = client.get("/api/health")
    assert response.status_code == 200


def test_health_check_payload():
    """Verify that GET /api/health returns the expected JSON structure and confirmation message."""
    response = client.get("/api/health")
    data = response.json()
    assert data["status"] == "healthy"
    assert "Smart Internship Management Backend is running" in data["message"]
    assert "environment" in data


def test_root_endpoint():
    """Verify that GET / returns a welcome message and links."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["health"] == "/api/health"

# Giya

### Discover places you never thought to search for.

An AI-powered travel discovery platform built to help travellers uncover places they might never have searched for, not just the destinations everyone already knows.

🌐 **Live Demo**  
https://by-vonn.github.io/giya/

---

# Why I Built Giya

Most travel planners are excellent at helping people visit places they already know.

Search for **Tokyo**, and you'll receive Tokyo.

Search for **Paris**, and you'll receive Paris.

But discovering places you've **never heard of** is surprisingly difficult.

As someone who enjoys backpacking, I wanted to explore a different question:

> **Can AI help travellers discover places they never thought to search for?**

Giya is my attempt to answer that question.

Rather than relying on a massive pre-built travel database, Giya generates recommendations on demand using AI, verifies information whenever possible, and continuously improves through intelligent caching.

The goal isn't to replace official travel information.

The goal is to make discovering the next destination easier.

---

# Live Demo

🌍 https://by-vonn.github.io/giya/

---

# Key Features

## 🤖 AI-powered destination discovery

Generate travel recommendations dynamically instead of relying on a massive manually maintained travel database.

---

## 🌏 Explore Nearby

Discover nearby cities and towns to naturally build backpacking routes instead of stopping only at famous destinations.

---

## ✅ Wikipedia-assisted verification

AI-generated descriptions are automatically cross-checked against Wikipedia whenever possible, helping improve transparency and reliability.

---

## 📷 Intelligent photo selection

Automatically selects representative images using Wikimedia Commons first, with free photography sources as fallback.

---

## 🗺️ Interactive trip planning

Users can:

- Save interesting spots
- Build a personal travel map
- Generate shareable travel plans
- Compare nearby destinations

without creating an account.

---

## 📈 Continuous learning

Instead of shipping with a fixed travel database, Giya grows naturally over time.

Frequently explored destinations become richer and faster through intelligent caching while keeping infrastructure costs extremely low.

---

# Technical Highlights

One of the goals of this project was exploring how far modern AI services could be pushed while operating almost entirely on free-tier infrastructure.

Highlights include:

- Cloudflare Workers backend
- Cloudflare KV intelligent caching
- AI-generated destination discovery
- Progressive recommendation generation
- Wikipedia-assisted verification
- Wikimedia Commons integration
- OpenStreetMap integration
- Session-based itinerary planning
- Low-cost, scalable architecture

---

# Architecture

```text
Browser (HTML / CSS / JavaScript)
            │
            ▼
 Cloudflare Worker
            │
 ├── Groq LLM
 ├── OpenStreetMap
 ├── Wikimedia Commons
 ├── Wikipedia API
 ├── Pexels API
 └── Cloudflare KV Cache
```

The frontend remains lightweight while most processing happens inside a Cloudflare Worker.

This architecture keeps deployment simple while allowing caching to improve performance and reduce operating costs over time.

---

# Design Philosophy

Rather than building the largest travel database possible, Giya focuses on:

- Intelligent discovery
- Transparent AI assistance
- Scalable architecture
- Low operating cost
- Continuous improvement

Some destinations naturally contain richer recommendations than others because Giya generates knowledge as destinations are explored.

This behaviour is intentional and reflects the product's design philosophy rather than missing content.

---

# Technology Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript

### Backend

- Cloudflare Workers
- Cloudflare KV

### AI

- Groq API

### Data Sources

- OpenStreetMap
- Wikimedia Commons
- Wikipedia
- Pexels

---

# Engineering Challenges

During development I explored solutions for several non-trivial engineering problems:

- Balancing AI quality with free-tier infrastructure
- Designing cache-first architecture instead of database-first architecture
- Safely handling inconsistent AI responses
- Verifying AI-generated travel information
- Reducing duplicate API requests
- Supporting destinations with little existing data
- Keeping the application responsive despite multiple external services

---

# Future Roadmap

Planned improvements include:

- User accounts
- Saved itineraries
- Collaborative trip planning
- Smarter recommendation ranking
- Seasonal recommendation engine
- Mobile-first optimisation
- Multi-language support

---

# Lessons Learned

Building Giya taught me considerably more than integrating AI APIs.

It required thinking about:

- Product design
- System architecture
- Scalability
- Caching strategies
- API orchestration
- User experience
- Cost optimisation

This project reinforced that successful AI products are not only about prompting language models—they're about designing systems that combine multiple services into a reliable and meaningful user experience.

---

# About This Project

Giya is an independent portfolio project built by a single developer.

Every design decision balances user experience, transparency, scalability and long-term maintainability while operating almost entirely on free-tier infrastructure.

Thank you for visiting!# Giya ✦ AI Backpacker Travel Planner

An AI-powered travel planning tool 
built for spontaneous backpackers.
Start with a cheap flight deal — 
Giya handles the rest.

## Live Demo
[Try Giya →](https://by-vonn.github.io/giya)

## Built With
- HTML, CSS, JavaScript
- Google Gemini API (AI brain)
- Leaflet + OpenStreetMap (maps)
- Unsplash API (photography)
- GitHub Pages (hosting)

## Portfolio Project
Built by wyivonn as a portfolio 
project demonstrating AI product 
development, UX design thinking, 
and prompt engineering.

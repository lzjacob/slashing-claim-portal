# Slashing Claim Portal

A crypto-powered frontend that allows users to initiate, bond, and track slashing claims for a staking product.

## Features

- 3-Step Claim Process: Form submission → Bonding consent → ETH transaction
- Dynamic Wallet Integration with Wagmi + Viem  
- Public Claims Dashboard
- Transaction Validation (14-day limit)
- Responsive Design with Tailwind CSS

## Quick Start

1. Install dependencies: `npm install`
2. Set up environment variables (see .env.example)
3. Initialize database: `npm run db:generate && npm run db:push`
4. Start development: `npm run dev`

## Tech Stack

- React + TypeScript + Vite
- Dynamic Labs + Wagmi + Viem
- SQLite + Prisma
- Tailwind CSS

## Project Structure

- `src/pages/` - Route components (HomePage, ClaimForm, BondConsent, BondFlow, FAQ)
- `src/components/` - Reusable components (Navbar)
- `src/lib/` - Utilities (API client, Web3 config, helpers)

## Contract Integration

Currently using mock contract address. Update `BOND_CONTRACT_ADDRESS` when real contract is deployed. 
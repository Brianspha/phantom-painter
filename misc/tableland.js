import { Database } from "@tableland/sdk";
import { providers } from "ethers";

// A Web3Provider wraps a standard Web3 provider, which is
// what MetaMask injects as window.ethereum into each page
const provider = new providers.Web3Provider(window.ethereum);

// MetaMask requires requesting permission to connect users accounts
await provider.send("eth_requestAccounts", []);

// The MetaMask plugin also allows signing transactions to
// pay for gas when calling smart contracts like the @tableland
// registry...
const signer = provider.getSigner();
const db = new Database({ signer });

// Prepared statements allow users to reuse query logic by binding values
const stmt = db.prepare("SELECT name, age FROM users_80001_1 LIMIT ?").bind(3);
const { results } = await stmt.all();
console.log(results);
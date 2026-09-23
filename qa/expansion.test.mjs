import test from 'node:test';
import assert from 'node:assert/strict';
import { newRun } from '../src/engine.js';
import { UNLOCK_MILESTONES, nextUnlock, checkNewUnlocks, activateNoble, decorateOffer, initLife } from '../src/life-core.js';
import { availableAuctionLot, bidAuctionLot, passAuctionLot, billQuote } from '../src/endgame-core.js';
import { AUCTION_LOTS, NOBLE_ITEMS, getAuctionLot, getNobleItem, getOutfit } from '../src/catalog.js';

test('Milestone unlock progression: nextUnlock and checkNewUnlocks', () => {
 const run = newRun();
 initLife(run);
 run.cash = 10000; // $100.00
 
 // At start ($100), next unlock should be 'tips' ($250)
 const n1 = nextUnlock(run);
 assert.ok(n1, 'Should find next unlock milestone');
 assert.equal(n1.milestone.id, 'tips');
 assert.equal(n1.target, 250);
 
 // Unlocks check with $100 should be empty
 const u0 = checkNewUnlocks(run);
 assert.equal(u0.length, 0);
 
 // Jump cash to $3,500 (350000 cents) -> unlocks tips, passport, radio, atlas
 run.cash = 350000;
 const u1 = checkNewUnlocks(run);
 assert.ok(u1.length >= 3);
 assert.ok(run.life.seenMilestones.includes('tips'));
 assert.ok(run.life.seenMilestones.includes('passport'));
 assert.ok(run.life.seenMilestones.includes('atlas'));
 
 // Next check without wealth increase should yield no new unlocks
 const u2 = checkNewUnlocks(run);
 assert.equal(u2.length, 0);
 
 // Jump to $150,000 (15000000 cents -> unlocks showdown, advanced, filter, music, affluence)
 run.cash = 15000000;
 const u3 = checkNewUnlocks(run);
 assert.ok(u3.length >= 4, 'Should unlock multiple milestones on wealth surge');
});

test('Auction system: bidding, LV points, medals, and upkeep', () => {
 const run = newRun();
 initLife(run);
 run.cash = 150000000; // $1.5M in cents (tier 4)
 
 const lot = availableAuctionLot(run);
 assert.ok(lot, 'Should have an available auction lot for high net worth');
 
 const initialCash = run.cash;
 
 const won = bidAuctionLot(run, lot.id);
 assert.equal(won.id, lot.id);
 assert.equal(run.cash, initialCash - lot.price);
 assert.ok(run.estate.auctionMedals.includes(lot.id));
 
 // Lot should not be available again
 const nextLot = availableAuctionLot(run);
 assert.notEqual(nextLot?.id, lot.id);
 
 // Bill should now include auction upkeep
 const quote = billQuote(run);
 assert.ok(quote.auctionUpkeep > 0, 'Bill breakdown must include auction maintenance fee');
});

test('Auction system: passing an auction adds to missedAuctions', () => {
 const run = newRun();
 initLife(run);
 run.cash = 150000000;
 const lot = availableAuctionLot(run);
 assert.ok(lot);
 
 passAuctionLot(run, lot.id);
 assert.ok(run.estate.missedAuctions.includes(lot.id));
 
 const nextLot = availableAuctionLot(run);
 assert.notEqual(nextLot?.id, lot.id);
});

test('Noble items: privilege summons overrides upcoming destination', () => {
 const run = newRun();
 initLife(run);
 run.cash = 50000000; // $500,000 to exceed ITEM_FLOORS for noble items
 run.life.items = ['noble-clinic'];
 
 const item = activateNoble(run, 'noble-clinic');
 assert.equal(item.id, 'noble-clinic');
 assert.equal(run.life.summonTarget, 'clinic');
 
 // Subsequent decorateOffer should respect summonTarget
 const offer = { type: 'project', rarity: 'common', title: 'Default', payout: 100, cost: 50 };
 const decorated = decorateOffer(run, offer);
 assert.equal(decorated.type, 'clinic');
 assert.equal(run.life.summonTarget, null, 'summonTarget should be cleared after application');
});

test('Outfits: LV bonus and upkeep integration', () => {
 const run = newRun();
 initLife(run);
 run.cash = 1000000;
 run.outfits = ['suit'];
 run.outfit = 'suit';
 
 const suit = getOutfit('suit');
 assert.equal(suit.lvPoints, 0.35);
 assert.equal(suit.upkeep, 500);
 
 const quote = billQuote(run);
 assert.equal(quote.outfitUpkeep, 500);
 assert.ok(quote.maintenance > quote.baseMaintenance);
});

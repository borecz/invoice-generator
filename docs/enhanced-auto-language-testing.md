# Enhanced Auto-Language Selection Testing Guide

## Overview
This guide provides comprehensive testing procedures for the enhanced language/country switcher with intelligent auto-language selection while preserving user choice.

## Pre-Test Setup
- [ ] Development server running at http://localhost:3000
- [ ] Browser developer tools open (Network and Console tabs)
- [ ] Clear browser localStorage: `localStorage.clear()`
- [ ] Start from English homepage: http://localhost:3000/en

## 1. Auto-Language Selection Testing

### Test 1.1: Native Language Countries
Test that selecting countries automatically switches to their native languages:

**Germany (DE → German)**
- [ ] Open language/country switcher
- [ ] Select Germany from country list
- [ ] Verify URL changes to `/de` immediately
- [ ] Verify UI switches to German language
- [ ] Verify country flag shows 🇩🇪
- [ ] Verify business logic applies (19% VAT, Euro currency)

**France (FR → French)**
- [ ] Select France from country list
- [ ] Verify URL changes to `/fr` immediately
- [ ] Verify UI switches to French language
- [ ] Verify country flag shows 🇫🇷
- [ ] Verify business logic applies (20% VAT, Euro currency)

**Netherlands (NL → Dutch)**
- [ ] Select Netherlands from country list
- [ ] Verify URL changes to `/nl` immediately
- [ ] Verify UI switches to Dutch language
- [ ] Verify country flag shows 🇳🇱
- [ ] Verify business logic applies (21% VAT, Euro currency)

**Portugal (PT → Portuguese)**
- [ ] Select Portugal from country list
- [ ] Verify URL changes to `/pt` immediately
- [ ] Verify UI switches to Portuguese language
- [ ] Verify country flag shows 🇵🇹
- [ ] Verify business logic applies (23% VAT, Euro currency)

**Sweden (SE → Swedish)**
- [ ] Select Sweden from country list
- [ ] Verify URL changes to `/sv` immediately
- [ ] Verify UI switches to Swedish language
- [ ] Verify country flag shows 🇸🇪
- [ ] Verify business logic applies (25% VAT, Swedish Krona)

**Denmark (DK → Danish)**
- [ ] Select Denmark from country list
- [ ] Verify URL changes to `/da` immediately
- [ ] Verify UI switches to Danish language
- [ ] Verify country flag shows 🇩🇰
- [ ] Verify business logic applies (25% VAT, Danish Krone)

**Finland (FI → Finnish)**
- [ ] Select Finland from country list
- [ ] Verify URL changes to `/fi` immediately
- [ ] Verify UI switches to Finnish language
- [ ] Verify country flag shows 🇫🇮
- [ ] Verify business logic applies (24% VAT, Euro currency)

**Greece (GR → Greek)**
- [ ] Select Greece from country list
- [ ] Verify URL changes to `/el` immediately
- [ ] Verify UI switches to Greek language
- [ ] Verify country flag shows 🇬🇷
- [ ] Verify business logic applies (24% VAT, Euro currency)

**Hungary (HU → Hungarian)**
- [ ] Select Hungary from country list
- [ ] Verify URL changes to `/hu` immediately
- [ ] Verify UI switches to Hungarian language
- [ ] Verify country flag shows 🇭🇺
- [ ] Verify business logic applies (27% VAT, Hungarian Forint)

### Test 1.2: Countries with English Default
Test countries that default to English but allow manual language override:

**United Kingdom**
- [ ] Select United Kingdom from country list
- [ ] Verify URL stays `/en` (English default)
- [ ] Verify country flag shows 🇬🇧
- [ ] Verify business logic applies (20% VAT, British Pound)

**Ireland**
- [ ] Select Ireland from country list
- [ ] Verify URL stays `/en` (English default)
- [ ] Verify country flag shows 🇮🇪
- [ ] Verify business logic applies (23% VAT, Euro currency)

## 2. User Override Capability Testing

### Test 2.1: Manual Language Override After Auto-Selection
Test that users can manually change language after auto-selection:

**Germany → English Override**
- [ ] Select Germany (auto-switches to German `/de`)
- [ ] Manually select English from language switcher
- [ ] Verify URL changes to `/en`
- [ ] Verify UI switches to English
- [ ] Verify country remains Germany (🇩🇪, German business logic)
- [ ] Verify manual override persists on page refresh

**France → Spanish Override**
- [ ] Select France (auto-switches to French `/fr`)
- [ ] Manually select Spanish from language switcher
- [ ] Verify URL changes to `/es`
- [ ] Verify UI switches to Spanish
- [ ] Verify country remains France (🇫🇷, French business logic)

### Test 2.2: Override Persistence
Test that manual overrides persist until country change:

**Override Persistence Test**
- [ ] Select Germany (auto-switches to German)
- [ ] Override to English manually
- [ ] Navigate to different pages (dashboard, settings)
- [ ] Verify language stays English, country stays Germany
- [ ] Refresh browser
- [ ] Verify override persists (English UI, German business logic)

**Override Reset on Country Change**
- [ ] With Germany + English override active
- [ ] Select France from country switcher
- [ ] Verify auto-switches to French (new country resets override)
- [ ] Verify URL changes to `/fr`
- [ ] Verify business logic switches to France

## 3. Language Coverage Expansion Testing

### Test 3.1: New Language Availability
Verify all 15 languages are available in the language switcher:

**Core Languages (8)**
- [ ] English (EN) - available and functional
- [ ] Italian (IT) - available and functional
- [ ] Czech (CS) - available and functional
- [ ] Russian (RU) - available and functional
- [ ] Spanish (ES) - available and functional
- [ ] French (FR) - available and functional
- [ ] Polish (PL) - available and functional
- [ ] German (DE) - available and functional

**New Languages (7)**
- [ ] Dutch (NL) - available and functional
- [ ] Portuguese (PT) - available and functional
- [ ] Swedish (SV) - available and functional
- [ ] Danish (DA) - available and functional
- [ ] Finnish (FI) - available and functional
- [ ] Greek (EL) - available and functional
- [ ] Hungarian (HU) - available and functional

### Test 3.2: Translation Completeness
Test that all new languages have complete translations:

**Dutch Translation Test**
- [ ] Switch to Dutch (`/nl`)
- [ ] Verify header navigation translated
- [ ] Verify dashboard content translated
- [ ] Verify language switcher labels translated
- [ ] Verify no missing translation warnings in console

**Portuguese Translation Test**
- [ ] Switch to Portuguese (`/pt`)
- [ ] Verify all UI elements properly translated
- [ ] Verify search placeholders translated
- [ ] Verify button labels translated

**Repeat for all new languages (Swedish, Danish, Finnish, Greek, Hungarian)**

## 4. Search and Auto-completion Testing

### Test 4.1: Multi-Language Search
Test search functionality works in all new languages:

**Dutch Interface Search**
- [ ] Switch to Dutch (`/nl`)
- [ ] Search countries: "Duits" should find Germany
- [ ] Search languages: "Frans" should find French
- [ ] Verify search results in Dutch

**Portuguese Interface Search**
- [ ] Switch to Portuguese (`/pt`)
- [ ] Search countries: "Alemanha" should find Germany
- [ ] Search languages: "Francês" should find French

### Test 4.2: Native Language Search
Test searching by native language names:

**Native Language Search**
- [ ] Search "Svenska" should find Swedish
- [ ] Search "Suomi" should find Finnish
- [ ] Search "Ελληνικά" should find Greek
- [ ] Search "Magyar" should find Hungarian

## 5. URL Routing and Navigation Testing

### Test 5.1: Direct URL Navigation
Test direct navigation to new language URLs:

**Direct URL Access**
- [ ] Navigate to `/nl` - loads Dutch interface
- [ ] Navigate to `/pt` - loads Portuguese interface
- [ ] Navigate to `/sv` - loads Swedish interface
- [ ] Navigate to `/da` - loads Danish interface
- [ ] Navigate to `/fi` - loads Finnish interface
- [ ] Navigate to `/el` - loads Greek interface
- [ ] Navigate to `/hu` - loads Hungarian interface

### Test 5.2: Invalid Locale Handling
- [ ] Navigate to `/invalid` - redirects to `/en`
- [ ] Navigate to `/xyz` - redirects to `/en`
- [ ] Verify graceful fallback behavior

## 6. Business Logic Integration Testing

### Test 6.1: Country-Specific Business Logic
Verify business logic remains tied to country selection:

**Tax Rate Verification**
- [ ] Netherlands: 21% VAT applied correctly
- [ ] Portugal: 23% VAT applied correctly
- [ ] Sweden: 25% VAT applied correctly
- [ ] Denmark: 25% VAT applied correctly
- [ ] Finland: 24% VAT applied correctly
- [ ] Greece: 24% VAT applied correctly
- [ ] Hungary: 27% VAT applied correctly (highest EU rate)

**Currency Display Verification**
- [ ] Netherlands: € symbol positioned correctly
- [ ] Portugal: € symbol positioned correctly
- [ ] Sweden: kr symbol positioned correctly
- [ ] Denmark: kr symbol positioned correctly
- [ ] Finland: € symbol positioned correctly
- [ ] Greece: € symbol positioned correctly
- [ ] Hungary: Ft symbol positioned correctly

## 7. Performance and Error Testing

### Test 7.1: Performance Metrics
- [ ] Auto-language switch completes < 500ms
- [ ] Search filtering performs < 100ms with 15 languages
- [ ] No memory leaks during extended testing
- [ ] Smooth transitions between languages

### Test 7.2: Error Handling
- [ ] Network failures during language switch handled gracefully
- [ ] Invalid country/language combinations rejected safely
- [ ] Console shows no JavaScript errors
- [ ] Fallback mechanisms work correctly

## 8. Accessibility Testing

### Test 8.1: Screen Reader Support
- [ ] Auto-language changes announced properly
- [ ] Country selection announces business logic changes
- [ ] Language override capability accessible via keyboard
- [ ] ARIA labels updated correctly for new languages

### Test 8.2: Keyboard Navigation
- [ ] Tab navigation works through all 15 languages
- [ ] Arrow keys navigate country/language lists
- [ ] Enter key triggers auto-language selection
- [ ] Escape key cancels selection appropriately

## 9. Integration Testing

### Test 9.1: Cross-Page Consistency
- [ ] Auto-selected language persists across all pages
- [ ] Manual overrides maintained throughout app
- [ ] Business logic consistent on all pages
- [ ] URL routing works on all pages

### Test 9.2: Authentication Integration
- [ ] Language preferences sync with user accounts
- [ ] Auto-selection works for authenticated users
- [ ] Manual overrides saved to user preferences
- [ ] Logout/login preserves language settings

## 10. Behavior Flow Verification

### Test 10.1: Complete User Journey
**Scenario: User selects France, then manually switches to English, then selects Germany**

1. **Initial State**
   - [ ] Start at `/en` (English)
   - [ ] Country: US, Language: English

2. **Select France**
   - [ ] Click France in country switcher
   - [ ] Verify auto-switch to `/fr` (French)
   - [ ] Verify French UI, French business logic

3. **Manual Override to English**
   - [ ] Click English in language switcher
   - [ ] Verify switch to `/en`
   - [ ] Verify English UI, French business logic maintained

4. **Select Germany**
   - [ ] Click Germany in country switcher
   - [ ] Verify auto-switch to `/de` (German)
   - [ ] Verify German UI, German business logic
   - [ ] Verify previous override cleared

## Test Completion Checklist

- [ ] All auto-language selections work correctly
- [ ] Manual overrides function properly
- [ ] All 15 languages available and translated
- [ ] Search works in all languages
- [ ] URL routing handles all locales
- [ ] Business logic tied to countries, not languages
- [ ] Performance meets requirements
- [ ] Accessibility standards maintained
- [ ] No console errors or warnings
- [ ] Cross-browser compatibility verified

## Notes Section
_Record any issues, observations, or suggestions during testing:_

---

**Testing Date:** ___________
**Tester:** ___________
**Browser/Device:** ___________
**Issues Found:** ___________
**Performance Notes:** ___________

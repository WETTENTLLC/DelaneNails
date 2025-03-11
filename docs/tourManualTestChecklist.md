# Tour Functionality Manual Test Checklist

This document provides a structured approach for manually testing all tour functionality.

## Basic CRUD Operations

- [ ] **Create Tour**
  - [ ] Create a tour with all required fields
  - [ ] Verify validation prevents creation without required fields
  - [ ] Verify only admin/tour-guide roles can create tours

- [ ] **Read Tours**
  - [ ] Get all tours (paginated)
  - [ ] Get a specific tour by ID
  - [ ] Verify virtual properties are populated (durationWeeks, reviews)
  - [ ] Verify guides are populated in response

- [ ] **Update Tour**
  - [ ] Update various tour fields
  - [ ] Verify validation on updates
  - [ ] Verify only admin/tour-guide roles can update tours

- [ ] **Delete Tour**
  - [ ] Delete a tour
  - [ ] Verify related images are also deleted
  - [ ] Verify only admin/tour-guide roles can delete tours

## Advanced Query Features

- [ ] **Filtering**
  - [ ] Filter by price (exact match)
  - [ ] Filter by price range (gte, lte)
  - [ ] Filter by difficulty
  - [ ] Filter by ratings

- [ ] **Sorting**
  - [ ] Sort by price (ascending)
  - [ ] Sort by price (descending)
  - [ ] Sort by ratings
  - [ ] Sort by multiple fields

- [ ] **Field Limiting**
  - [ ] Select only specific fields
  - [ ] Verify excluded fields don't appear in response

- [ ] **Pagination**
  - [ ] Set page number and limit
  - [ ] Verify correct number of results returned
  - [ ] Verify correct page is returned

## Statistics and Analytics

- [ ] **Tour Stats**
  - [ ] Get aggregated statistics
  - [ ] Verify stats are grouped correctly by difficulty
  - [ ] Verify calculations (avg, min, max, etc.)

- [ ] **Top Tours**
  - [ ] Use the alias endpoint for top-rated tours
  - [ ] Verify sorting and field limiting

## Booking Functionality

- [ ] **Book Tour**
  - [ ] Create a booking for a tour
  - [ ] Verify date and participant validation
  - [ ] Verify authentication requirement

- [ ] **Booking Restrictions**
  - [ ] Verify users can't book the same tour twice
  - [ ] Verify validation for booking dates

## Review System

- [ ] **Add Review**
  - [ ] Add a review to a tour
  - [ ] Verify rating validation (1-5 range)
  - [ ] Verify authentication requirement
  - [ ] Verify can only review if booked the tour

- [ ] **Rating Updates**
  - [ ] Verify tour ratings average is updated when review is added
  - [ ] Verify tour ratings quantity is incremented
  - [ ] Verify tour ratings are updated when review is updated/deleted

## Geospatial Features

- [ ] **Tours Within Radius**
  - [ ] Find tours within a specified distance
  - [ ] Verify coordinate validation

- [ ] **Distances to Tours**
  - [ ] Calculate distances from point to all tours
  - [ ] Verify coordinate validation
  - [ ] Verify distance calculation accuracy

## Image Handling

- [ ] **Upload Tour Images**
  - [ ] Upload a single image
  - [ ] Upload multiple images
  - [ ] Verify image resizing
  - [ ] Verify file type validation
  - [ ] Verify size validation
  - [ ] Verify authentication and authorization

## Security & Error Handling

- [ ] **Authentication**
  - [ ] Verify protected routes reject unauthenticated requests
  - [ ] Verify JWT validation
  - [ ] Verify expiry handling

- [ ] **Authorization**
  - [ ] Verify role-based access controls
  - [ ] Verify users can't modify other users' data

- [ ] **Error Handling**
  - [ ] Verify 404 for non-existent tour
  - [ ] Verify validation errors return appropriate 400 responses
  - [ ] Verify authorization errors return 401/403
  - [ ] Verify MongoDB duplicate key errors are handled gracefully

const puppeteer = require('puppeteer');
const { setupTestEnvironment } = require('../setup');

describe('NailAide End-to-End Workflows', () => {
  let browser;
  let page;
  let testEnv;
  
  beforeAll(async () => {
    testEnv = await setupTestEnvironment();
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
  });
  
  afterAll(async () => {
    await browser.close();
    await testEnv.teardown();
  });
  
  describe('Appointment Booking Flow', () => {
    test('User can search for available slots and book appointment', async () => {
      // Navigate to the booking page
      await page.goto('http://localhost:3000/book');
      
      // Select a date from the calendar
      await page.click('[data-testid="date-picker"]');
      await page.click('.calendar-day[data-date="2023-12-01"]');
      
      // Select a service
      await page.select('[data-testid="service-select"]', 'Gel Manicure');
      
      // Check for available time slots
      await page.waitForSelector('[data-testid="available-slots"]');
      
      // Select a time slot
      await page.click('[data-testid="time-slot-14-00"]');
      
      // Fill client information
      await page.type('[data-testid="client-name"]', 'Sarah Johnson');
      await page.type('[data-testid="client-email"]', 'sarah@example.com');
      await page.type('[data-testid="client-phone"]', '555-765-4321');
      
      // Submit the booking form
      await page.click('[data-testid="book-button"]');
      
      // Verify confirmation appears
      await page.waitForSelector('[data-testid="booking-confirmation"]');
      
      const confirmationText = await page.$eval(
        '[data-testid="booking-confirmation"]',
        el => el.textContent
      );
      
      expect(confirmationText).toContain('Sarah Johnson');
      expect(confirmationText).toContain('Gel Manicure');
    }, 30000);
  });
  
  describe('Technician Dashboard Flow', () => {
    test('Technician can view and manage daily schedule', async () => {
      // Login as technician
      await page.goto('http://localhost:3000/login');
      await page.type('[data-testid="username"]', 'tech1');
      await page.type('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to dashboard
      await page.waitForSelector('[data-testid="tech-dashboard"]');
      
      // Check today's appointments
      await page.click('[data-testid="today-tab"]');
      await page.waitForSelector('[data-testid="appointments-list"]');
      
      // Verify appointments are displayed
      const appointmentCount = await page.$$eval(
        '.appointment-card',
        items => items.length
      );
      expect(appointmentCount).toBeGreaterThan(0);
      
      // Mark an appointment as completed
      await page.click('[data-appointment-id="appt-123"] [data-testid="complete-button"]');
      
      // Verify status changed
      await page.waitForFunction(
        'document.querySelector("[data-appointment-id=\'appt-123\']").textContent.includes("Completed")'
      );
      
      // Check inventory alerts
      await page.click('[data-testid="inventory-tab"]');
      await page.waitForSelector('[data-testid="low-stock-alerts"]');
      
      // Verify alerts are shown
      const alerts = await page.$eval(
        '[data-testid="low-stock-alerts"]',
        el => el.textContent
      );
      expect(alerts).toContain('Acetone Remover');
    }, 30000);
  });
  
  describe('Performance Testing', () => {
    test('Dashboard loads within acceptable time', async () => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForSelector('[data-testid="dashboard-loaded"]');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Dashboard should load in under 3 seconds
    });
  });
});

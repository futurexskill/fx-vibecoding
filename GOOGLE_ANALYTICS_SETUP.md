# Google Analytics Setup Guide
## Adding GA4 Tracking to Your Stock Dashboard

### 🎯 **Quick Setup Instructions**

1. **Get Your GA4 Measurement ID**:
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create a new GA4 property for your stock dashboard
   - Copy your Measurement ID (format: `G-XXXXXXXXXX`)

2. **Update Configuration**:
   Replace `GA_MEASUREMENT_ID` in these files with your actual ID:
   
   **File: `index.html`** (Line ~35)
   ```html
   <!-- Replace GA_MEASUREMENT_ID with your actual ID -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     gtag('config', 'G-XXXXXXXXXX', {
   ```
   
   **File: `src/utils/analytics.ts`** (Line ~11)
   ```typescript
   private static measurementId = 'G-XXXXXXXXXX'; // Your actual GA4 ID
   ```

3. **Deploy and Test**:
   - Build and deploy your updated dashboard
   - Visit your site and check Google Analytics Real-time reports
   - Verify events are being tracked

---

### 📊 **What's Being Tracked**

#### **Page Views**
- ✅ Homepage visits
- ✅ Stock detail page views with stock symbol
- ✅ SPA navigation tracking

#### **User Interactions**
- ✅ Stock card clicks from dashboard
- ✅ Manual data refresh actions
- ✅ Navigation between pages

#### **API Performance**
- ✅ API call success/failure rates
- ✅ Response times for data loading
- ✅ Error tracking and debugging

#### **Stock-Specific Events**
- ✅ Detailed stock views with metadata
- ✅ Stock symbol, name, price, and sector data
- ✅ Market performance tracking

#### **Error Monitoring**
- ✅ API failures and network issues
- ✅ Component rendering errors
- ✅ User experience problems

---

### 🔧 **Custom Events Reference**

#### **Available Events**
```javascript
// Page navigation
GoogleAnalytics.trackPageView(path, title)

// Stock interactions
StockAnalytics.trackDetailedStockView(stockData)
StockAnalytics.trackStockComparison([symbols])

// Dashboard actions
GoogleAnalytics.trackDashboardAction('refresh', {data})
GoogleAnalytics.trackDashboardAction('stock_selected', {symbol})

// Performance monitoring
GoogleAnalytics.trackAPICall(endpoint, success, responseTime)
GoogleAnalytics.trackPerformance('load_time', milliseconds)

// Error tracking
GoogleAnalytics.trackError(error, context)
```

#### **Custom Dimensions Available**
- Stock Symbol
- Stock Name  
- Stock Price
- Market Cap
- Sector
- Response Time
- Error Context

---

### 📈 **GA4 Dashboard Setup**

#### **Recommended Reports**
1. **User Behavior Flow**: See how users navigate your dashboard
2. **Stock Performance**: Which stocks get the most views
3. **API Performance**: Monitor loading times and failures
4. **Real-time**: Monitor live user activity
5. **Conversions**: Track engagement goals

#### **Custom Goals to Set**
- Stock detail page views (engagement)
- Time spent on dashboard (session quality)
- API success rate (technical performance)
- Return visitors (user retention)

#### **Useful Segments**
- Mobile vs Desktop users
- New vs Returning visitors
- High-engagement users (multiple stock views)
- Users experiencing errors

---

### 🎛️ **Advanced Analytics Features**

#### **Enhanced Ecommerce Events** (Ready for future features)
```javascript
// If you add portfolio features
GoogleAnalytics.trackConversion('portfolio_add', stockPrice)

// If you add alerts or subscriptions  
GoogleAnalytics.trackConversion('alert_setup', 0)
```

#### **User Properties**
```javascript
// Set user preferences for better segmentation
GoogleAnalytics.setUserProperties({
  'preferred_market': 'US',
  'user_type': 'investor',
  'dashboard_theme': 'dark'
})
```

#### **Performance Monitoring**
```javascript
// Track Core Web Vitals
GoogleAnalytics.trackPerformance('FCP', firstContentfulPaint)
GoogleAnalytics.trackPerformance('LCP', largestContentfulPaint) 
GoogleAnalytics.trackPerformance('CLS', cumulativeLayoutShift)
```

---

### 🔒 **Privacy & Compliance**

#### **GDPR Compliance** (If serving EU users)
Add this before GA initialization:
```javascript
// Disable tracking until consent
gtag('consent', 'default', {
  'analytics_storage': 'denied'
});

// Enable after user consent
gtag('consent', 'update', {
  'analytics_storage': 'granted'
});
```

#### **Data Retention**
- Set appropriate data retention periods in GA4
- Review what data is collected vs business needs
- Consider IP anonymization if required

---

### 🚀 **Testing Your Analytics**

#### **Real-time Testing**
1. Open your dashboard in a new browser session
2. Navigate between homepage and stock pages
3. Check GA4 Real-time reports for events
4. Verify custom events appear correctly

#### **Debug Mode**
Enable GA4 debug mode:
```javascript
gtag('config', 'G-XXXXXXXXXX', {
  debug_mode: true
});
```

#### **Google Analytics Debugger**
- Install GA Debugger Chrome extension
- Monitor console for tracking events
- Verify event parameters are correct

---

### 📋 **Checklist**

- [ ] Replace GA_MEASUREMENT_ID with actual Google Analytics 4 ID
- [ ] Test real-time tracking on homepage
- [ ] Verify stock detail page tracking works
- [ ] Confirm API performance events are firing
- [ ] Check error tracking with intentional API failure
- [ ] Set up GA4 dashboard with relevant reports
- [ ] Configure goals and conversion tracking
- [ ] Test on mobile devices
- [ ] Review privacy compliance requirements
- [ ] Document any custom events for your team

Your stock dashboard now has comprehensive Google Analytics 4 tracking! 📊🚀
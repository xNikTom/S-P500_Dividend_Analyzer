# Dividend Analyzer - Project Requirements

Please list your expected features, functionality, and any specific design preferences below.

## 1. Core Features (User Input Required)
- This is an application which tracks Stocks from S&P 500 index which have forward dividend yeald of more than 4% a year and analizes them.

## 2. Functionality
- List stocks from S&P 500 index for witch the Dividend yeald is more than 4% a year.
- Once list is fetched there should be analysis of the stocks fundamentals primarily focused on dividend investment for passive income. Use the best known practices for dividend harvesting and their respective stock indicators - yeald, consecutive years of dividends, payout ratio, etc.
- As a second criteria there should be analysis of the stocks based on value investment parameters as if you are Warren Buffet.
- On the main screen of the app the filtered stocks will be listed from best to worst based on the dividend and fundamentals score.
- Any stock ticker could be clicked which would lead to a personal card of the stock with more information about the important indicators (and current price).

## 3. Design Preferences
- Dark mode of displaying the data with bright text
- On the main screen, each listed stock should contain basic info - ticker, company name, overal score, dividend score, dividend yeald, fundamentals score. Ticker name is either a link to personalized page for the stock or will just expand the information. Whichever is best from design practice.
- Once a stock is clicked there should be more indicators relative for dividend and fundamental investing. Please include 52week low and 52week high prices as well as current price.
- View for both main page and individual stock should be compact.
- Have a color coding: green if indicator is considered good, red if bad.
- Top five stocks on the list should have Recommended banner or star.

## 4. Other Requirements
- Can be used on an iPhone
- Has an offline mode / cached view
- Fetch data for stocks from a free source which does not include paid API's and narrow API limits. No limits for the method - API, website scraping or other.
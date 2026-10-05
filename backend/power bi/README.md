# CloudCalc Pro - Power BI Analytics

This folder contains the Power BI analytics configuration for CloudCalc Pro.

## Data Source

Power BI connects to the CloudCalc MySQL database.

Database:
- Name: cloudcalc
- Database: MySQL

## Analytics Views

The following MySQL views are available for Power BI:

1. vw_overall_analytics
2. vw_operation_analytics
3. vw_daily_calculations
4. vw_user_summary
5. vw_user_activity
6. vw_calculation_summary

## Dashboard Metrics

The Power BI dashboard can display:

- Total Calculations
- Active Users
- Active Days
- Average Result
- Highest Result
- Lowest Result
- Calculations by Operation
- Daily Calculation Activity
- User Activity

## Power BI Report

The Power BI `.pbix` file can be stored inside:

powerbi/analytics_pbix/

The `.pbix` file should not be committed if it becomes too large for GitHub.
// Utility functions for exporting analytics data to CSV

export interface AnalyticsData {
    userStats: {
        totalUsers: number;
        activeUsers: number;
        bannedUsers: number;
        totalChatsUsers: number;
        totalUsersChange: string;
        activeUsersChange: string;
        bannedUsersChange: string;
        totalChatsChange: string;
    };
    dealTrends: Array<{ month: string; value: number }>;
    propertyInsights: Array<{ month: string; luxury: number; commercial: number }>;
    userLocations: Array<{ country: string; users: number; level: string }>;
}

export function exportToCSV(data: AnalyticsData) {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `analytics-report-${timestamp}.csv`;

    // Create CSV content
    let csvContent = '';

    // Section 1: User Statistics
    csvContent += '=== USER STATISTICS ===\n';
    csvContent += 'Metric,Value,Change\n';
    csvContent += `Total Users,${data.userStats.totalUsers},${data.userStats.totalUsersChange}\n`;
    csvContent += `Active Users,${data.userStats.activeUsers},${data.userStats.activeUsersChange}\n`;
    csvContent += `Banned Users,${data.userStats.bannedUsers},${data.userStats.bannedUsersChange}\n`;
    csvContent += `Total Chats Users,${data.userStats.totalChatsUsers},${data.userStats.totalChatsChange}\n`;
    csvContent += '\n';

    // Section 2: Deal Trends
    csvContent += '=== DEAL TRENDS (Monthly Performance) ===\n';
    csvContent += 'Month,Performance (%)\n';
    data.dealTrends.forEach((item) => {
        csvContent += `${item.month},${item.value}\n`;
    });
    csvContent += '\n';

    // Section 3: Property Insights
    csvContent += '=== PROPERTY INSIGHTS (By Type) ===\n';
    csvContent += 'Month,Luxury,Commercial\n';
    data.propertyInsights.forEach((item) => {
        csvContent += `${item.month},${item.luxury},${item.commercial}\n`;
    });
    csvContent += '\n';

    // Section 4: Top User Locations
    csvContent += '=== TOP USER LOCATIONS ===\n';
    csvContent += 'Country,Users,Usage Level\n';
    data.userLocations.forEach((item) => {
        csvContent += `${item.country},${item.users},${item.level}\n`;
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Sample data generator (replace with real data from API)
export function generateSampleAnalyticsData(): AnalyticsData {
    return {
        userStats: {
            totalUsers: 284,
            activeUsers: 64,
            bannedUsers: 5,
            totalChatsUsers: 14,
            totalUsersChange: '+22 product',
            activeUsersChange: '↑ 8%',
            bannedUsersChange: '↓ 3%',
            totalChatsChange: '↑ 5%',
        },
        dealTrends: [
            { month: 'Jan', value: 50 },
            { month: 'Feb', value: 55 },
            { month: 'Mar', value: 60 },
            { month: 'Apr', value: 72 },
            { month: 'May', value: 68 },
            { month: 'Jun', value: 78 },
            { month: 'Jul', value: 75 },
        ],
        propertyInsights: [
            { month: 'Jan', luxury: 20, commercial: 30 },
            { month: 'Feb', luxury: 25, commercial: 35 },
            { month: 'Mar', luxury: 70, commercial: 85 },
            { month: 'Apr', luxury: 30, commercial: 40 },
            { month: 'May', luxury: 35, commercial: 45 },
            { month: 'Jun', luxury: 40, commercial: 50 },
            { month: 'Jul', luxury: 25, commercial: 35 },
        ],
        userLocations: [
            { country: 'Indonesia', users: 1250, level: 'high' },
            { country: 'United States', users: 980, level: 'high' },
            { country: 'China', users: 850, level: 'high' },
            { country: 'India', users: 720, level: 'high' },
            { country: 'Singapore', users: 450, level: 'medium' },
            { country: 'Malaysia', users: 420, level: 'medium' },
            { country: 'Thailand', users: 380, level: 'medium' },
            { country: 'Vietnam', users: 340, level: 'medium' },
            { country: 'Philippines', users: 310, level: 'medium' },
            { country: 'Japan', users: 280, level: 'low' },
            { country: 'South Korea', users: 250, level: 'low' },
            { country: 'Australia', users: 220, level: 'low' },
            { country: 'United Kingdom', users: 200, level: 'low' },
            { country: 'Germany', users: 180, level: 'low' },
            { country: 'France', users: 160, level: 'low' },
            { country: 'Canada', users: 140, level: 'low' },
            { country: 'Brazil', users: 120, level: 'low' },
        ],
    };
}

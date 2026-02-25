// Utility functions for exporting user data to CSV

export interface UserExportData {
    id: string;
    name: string;
    email: string;
    status: string;
    totalChats: number;
    tokensUsed: string;
    lastActive: string;
    joinDate: string;
}

export function exportUsersToCSV(users: UserExportData[]) {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `users-export-${timestamp}.csv`;

    // Create CSV header
    let csvContent = 'Username,Email,Status,Total Chats,Tokens Used,Last Active,Join Date\n';

    // Add user data
    users.forEach((user) => {
        csvContent += `"${user.name}","${user.email}","${user.status}",${user.totalChats},"${user.tokensUsed}","${user.lastActive}","${user.joinDate}"\n`;
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

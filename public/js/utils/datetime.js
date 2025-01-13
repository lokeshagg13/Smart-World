function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    // Format options
    const options = {
        year: 'numeric', // e.g., 2024
        month: 'short',   // e.g., December
        day: 'numeric',  // e.g., 30
        hour: '2-digit', // e.g., 03
        minute: '2-digit', // e.g., 45
        second: '2-digit', // e.g., 12
        hour12: false // Use 12-hour format
    };

    return new Intl.DateTimeFormat('en-US', options).format(date);
}
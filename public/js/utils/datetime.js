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

function formatDisplayETA(seconds) {
    const hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    mins = (seconds % 60 > 0)
        ? mins + 1
        : mins;

    const hrText = hrs > 0 ? `${hrs.toFixed(0)} hr` : '';
    const minText = mins > 0 ? `${mins.toFixed(0)} min` : '';
    return [hrText, minText].filter(Boolean).join(' ');
}
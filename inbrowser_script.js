function scrapeAndDownloadCSV() {
  // --- 1. Scraper Logic ---
  const jobs = [];
  const jobCards = document.querySelectorAll('li.semantic-search-results-list__list-item');

  jobCards.forEach(card => {
    // Helper function to safely get text
    const getText = (selector) => {
      const element = card.querySelector(selector);
      return element ? element.textContent.trim().replace(/\s+/g, ' ') : null;
    };
    // Helper function to safely get a link
    const getLink = (selector) => {
      const element = card.querySelector(selector);
      return element ? element.href : null;
    };

    const title = getText('div.artdeco-entity-lockup__title');
    const company = getText('div.artdeco-entity-lockup__subtitle');
    const location = getText('div.artdeco-entity-lockup__caption');
    const posted = getText('time');
    const link = getLink('a.job-card-job-posting-card-wrapper__card-link');

    // Find notes (Easy Apply, etc.)
    let notes = [];
    const footerItems = card.querySelectorAll('.job-card-job-posting-card-wrapper__footer-item');
    footerItems.forEach(item => {
      const itemText = item.textContent.trim();
      if (itemText && itemText !== posted) {
        notes.push(itemText.replace(/\s+/g, ' '));
      }
    });

    // Find insights (Actively reviewing, etc.)
    const insight = getText('.job-card-job-posting-card-wrapper__job-insight-text');
    if (insight && !insight.includes('work here')) { // Filter out connection info
      notes.push(insight);
    }

    // Only add if it's a valid job posting
    if (title && company) {
      jobs.push({
        Title: title,
        Company: company,
        Location: location,
        Posted: posted,
        Notes: notes.join(', '), // Join all notes
        Link: link
      });
    }
  });

  // Log to console for confirmation
  console.log(`Found ${jobs.length} jobs. Preparing CSV...`);
  console.table(jobs);

  // --- 2. CSV Generation ---

  // Helper function to properly escape data for CSV
  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    let result = String(str);
    // If the string contains a comma, double quote, or newline, wrap it in double quotes
    if (result.search(/("|,|\n)/g) >= 0) {
      // Enclose in double quotes and double-up any existing double quotes
      result = `"${result.replace(/"/g, '""')}"`;
    }
    return result;
  };

  const headers = ['Title', 'Company', 'Location', 'Posted', 'Notes', 'Link'];
  // Start CSV content with the header row
  let csvContent = headers.join(',') + '\n';

  // Add each job as a new row
  jobs.forEach(job => {
    const row = [
      escapeCSV(job.Title),
      escapeCSV(job.Company),
      escapeCSV(job.Location),
      escapeCSV(job.Posted),
      escapeCSV(job.Notes),
      escapeCSV(job.Link)
    ];
    csvContent += row.join(',') + '\n';
  });

  // --- 3. Download Trigger ---
  
  // Create a Blob (binary large object) with the CSV data
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create a temporary link element to trigger the download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'linkedin_jobs.csv'); // This is the file name
  link.style.visibility = 'hidden';

  // Add the link to the page, click it, and then remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Run the main function
scrapeAndDownloadCSV();

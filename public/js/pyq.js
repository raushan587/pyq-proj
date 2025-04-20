/*document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");

  // Handle the search form submission
  form.addEventListener("submit", (e) => {
    const branch = document.getElementById("branch").value;
    const year = document.getElementById("year").value;
    const semester = document.getElementById("semester").value;

    if (!branch || !year || !semester) {
      e.preventDefault(); // Stop the form if any field is empty
      alert("Please select branch, year, and semester.");
    }
    // Otherwise let it submit naturally (GET)
  });

  // Handle download button clicks
  document.querySelectorAll('.download-btn').forEach((button) => {
    button.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');  // Get question paper ID
      console.log('Download clicked for ID:', id);  // Debug log

      try {
        const response = await fetch(`/pyq/download/${id}`);
        if (response.ok) {
          const blob = await response.blob();
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'question-paper.pdf'; // Or dynamic name if needed
          link.click();
        } else {
          console.error('Download failed:', response.statusText);
        }
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    });
  });
});*/

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.download-btn').forEach((button) => {
    button.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      console.log('Download clicked for ID:', id); // For debugging

      try {
        const response = await fetch(`/pyq/download/${id}`);
        if (response.ok) {
          const blob = await response.blob();
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'question-paper.pdf'; // Optional: customize
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          console.error('Failed to download file:', response.statusText);
          alert("Download failed.");
        }
      } catch (error) {
        console.error('Error downloading file:', error);
        alert("Error downloading file.");
      }
    });
  });
});

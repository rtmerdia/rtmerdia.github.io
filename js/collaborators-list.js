document.addEventListener('DOMContentLoaded', function() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const collaboratorCards = document.querySelectorAll('.collaborator-card');
  const resultsCount = document.getElementById('results-count');
  
  let currentThreatFilter = 'all';
  let currentStatusFilter = 'all';

  function updateResultsCount() {
    const visibleCards = document.querySelectorAll('.collaborator-card:not([style*="display: none"])');
    if (resultsCount) {
      resultsCount.textContent = visibleCards.length;
    }
  }

  function filterCards() {
    let visibleCount = 0;
    
    collaboratorCards.forEach(card => {
      const threatRank = card.getAttribute('data-threat-rank').toLowerCase();
      const status = card.getAttribute('data-status').toLowerCase();
      
      const threatMatch = currentThreatFilter === 'all' || threatRank === currentThreatFilter;
      const statusMatch = currentStatusFilter === 'all' || status === currentStatusFilter;
      
      if (threatMatch && statusMatch) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    updateResultsCount();
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const filterType = this.getAttribute('data-type');
      const filterValue = this.getAttribute('data-filter');
      
      // Remove active class from siblings
      const siblings = this.parentElement.querySelectorAll('.filter-btn');
      siblings.forEach(sibling => sibling.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Update current filter
      if (filterType === 'threat') {
        currentThreatFilter = filterValue;
      } else if (filterType === 'status') {
        currentStatusFilter = filterValue;
      }
      
      // Apply filters
      filterCards();
    });
  });

  // Initialize results count
  updateResultsCount();
});
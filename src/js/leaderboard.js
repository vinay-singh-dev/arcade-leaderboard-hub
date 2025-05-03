
// Leaderboard data and functionality

document.addEventListener('DOMContentLoaded', function() {
  // Fetch leaderboard data from API
  fetchLeaderboardData()
    .then(processLeaderboardData)
    .then(populateLeaderboard)
    .catch(error => {
      console.error('Error loading leaderboard:', error);
      // If API fails, use backup data
      const backupData = getBackupData();
      populateLeaderboard(backupData);
    });
  
  // Function to fetch data from the API
  async function fetchLeaderboardData() {
    const response = await fetch('https://techhack.tioitservices.in/leaderboard/get_users.php');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  }
  
  // Process the API data to calculate total scores and sort by rank
  function processLeaderboardData(data) {
    return data.map(person => {
      // Convert string values to numbers and calculate total score
      const skillBadges = parseInt(person.skill_badges) || 0;
      const arcadeGames = parseInt(person.arcade_games) || 0;
      const triviaGames = parseInt(person.trivia_games) || 0;
      const labCourses = parseInt(person.lab_courses) || 0;
      const totalScore = skillBadges + arcadeGames + triviaGames + labCourses;
      
      return {
        id: person.id,
        name: person.user_name,
        score: totalScore,
        // Use a placeholder avatar if needed
        avatar: `src/assets/avatars/avatar${Math.min(parseInt(person.id) || 1, 10)}.jpg`,
        details: {
          skillBadges,
          arcadeGames,
          triviaGames,
          labCourses,
          skillBadges: parseInt(person.skill_badges) || 0
        }
      };
    }).sort((a, b) => b.score - a.score) // Sort by score descending
      .map((person, index) => ({...person, rank: index + 1})); // Add rank based on sorted position
  }

  
  // Function to populate the leaderboard
  function populateLeaderboard(data) {
    // Handle top 3 performers for the podium
    updatePodium(data.slice(0, 3));
    
    // Handle the rest of the leaderboard (ranks 4+)
    const leaderboardContainer = document.querySelector('.leaderboard');
    if (!leaderboardContainer) return;
    
    // Clear existing content
    leaderboardContainer.innerHTML = '';
    
    // Add each leaderboard item (starting from rank 4)
    const remainingData = data.slice(3);
    remainingData.forEach(person => {
      const leaderboardItem = document.createElement('div');
      leaderboardItem.classList.add('leaderboard-item');
      
      // Format individual point values with commas
      const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      const skillBadges = formatNumber(person.details.skillBadges);
      const arcadePoints = formatNumber(person.details.arcadeGames);
      const triviaPoints = formatNumber(person.details.triviaGames);
      const labPoints = formatNumber(person.details.labCourses);
      const totalPoints = formatNumber(person.score);
      
      leaderboardItem.innerHTML = `
        <div class="leaderboard-rank">${person.rank}</div>
        <div class="leaderboard-info">
          &nbsp;&nbsp;&nbsp;<img src="public/avatar.png" alt="${person.name}" class="leaderboard-avatar">
          <div class="leaderboard-name">${person.name}</div>
        </div>
        <div class="leaderboard-points">
           <div class="point-details">
            <span class="point-label">Skill Badges:</span> ${skillBadges}
          </div>
          <div class="point-details">
            <span class="point-label">Arcade Games:</span> ${arcadePoints}
          </div>
          <div class="point-details">
            <span class="point-label">Trivia Games:</span> ${triviaPoints}
          </div>
          <div class="point-details">
            <span class="point-label">Lab Courses:</span> ${labPoints}
          </div>
          <!--<div class="leaderboard-score">${totalPoints} pts</div>-->
        </div>
      `;
      
      leaderboardContainer.appendChild(leaderboardItem);
      
      // Add animation delay for staggered appearance
      setTimeout(() => {
        leaderboardItem.classList.add('fade-in');
      }, (person.rank - 3) * 150);
    });
  }
  
  // Function to update the podium with top 3 performers
  function updatePodium(topThree) {
    if (topThree.length < 3) return; // Ensure we have enough data
    
    // Map positions to their corresponding places on the podium
    const positions = [
      { place: 'place-1', index: 0 }, // First place
      { place: 'place-2', index: 1 }, // Second place
      { place: 'place-3', index: 2 }  // Third place
    ];
    
    // Function to format numbers with commas
    const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    // Update each podium position
    positions.forEach(position => {
      const person = topThree[position.index];
      const podiumElement = document.querySelector(`.${position.place}`);
      
      if (podiumElement && person) {
        const avatar = podiumElement.querySelector('.avatar');
        const name = podiumElement.querySelector('h3');
        const totalPoints = podiumElement.querySelector('.total-points');
        const rank = podiumElement.querySelector('.rank');
        
        // Update point breakdown
        const breakdown = podiumElement.querySelector('.point-breakdown');
        if (breakdown && person.details) {
          const categories = breakdown.querySelectorAll('.point-category');
          if (categories.length >= 3) {
            categories[0].querySelector('span').textContent = formatNumber(person.details.skillBadges);
            categories[1].querySelector('span').textContent = formatNumber(person.details.arcadeGames);
            categories[2].querySelector('span').textContent = formatNumber(person.details.triviaGames);
            categories[3].querySelector('span').textContent = formatNumber(person.details.labCourses);
          }
        }
        
        if (avatar) avatar.src = person.avatar;
        if (name) name.textContent = person.name;
        //if (totalPoints) totalPoints.textContent = `${formatNumber(person.score)} pts`;
        if (rank) rank.textContent = person.rank;
      }
    });
  }
});

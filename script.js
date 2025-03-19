document
  .getElementById("scheduleForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Zapobiega przeładowaniu strony

    // Pobieranie wartości z formularza
    const daysInMonth = parseInt(document.getElementById("daysInMonth").value);
    const noNightShifts = parseInt(
      document.getElementById("noNightShifts").value
    );
    const nightShiftDays = daysInMonth - noNightShifts;

    // Obliczanie ilości grup
    const totalGD6 = daysInMonth * 2;
    const totalGD7 = daysInMonth * 2;
    const totalGD14 = daysInMonth * 3;
    const totalGN22 = daysInMonth * 2;

    // Pobieranie stanów etatowych zespołów
    const teams = ["wk", "wm", "wz", "pg", "wn", "wds"];
    let teamData = {};
    let totalMembers = 0;
    let totalWomen = 0;
    let totalWomenNight = 0;

    teams.forEach((team) => {
      let total = parseInt(document.getElementById(`${team}_total`).value);
      let women = parseInt(document.getElementById(`${team}_women`).value);
      let womenNight = parseInt(
        document.getElementById(`${team}_women_night`).value
      );

      teamData[team] = { total, women, womenNight };
      totalMembers += total;
      totalWomen += women;
      totalWomenNight += womenNight;
    });

    let assignedGroups = {};
    let remainingGD6 = totalGD6;
    let remainingGD7 = totalGD7;
    let remainingGD14 = totalGD14;
    let remainingGN22 = totalGN22;
    let remainingWomenGD14 = daysInMonth; // Każdego dnia jedna kobieta w GD14
    let remainingWomenGN22 = nightShiftDays; // Tylko w określone dni kobieta w GN22

    teams.forEach((team) => {
      let proportion = teamData[team].total / totalMembers;

      assignedGroups[team] = {
        GD6: Math.floor(proportion * totalGD6),
        GD7: Math.floor(proportion * totalGD7),
        GD14: Math.floor(proportion * totalGD14),
        GN22: Math.floor(proportion * totalGN22),
        GD14_Women: Math.floor(
          (teamData[team].women / totalWomen) * daysInMonth
        ),
        GN22_Women: Math.floor(
          (teamData[team].womenNight / totalWomenNight) * nightShiftDays
        ),
      };

      remainingGD6 -= assignedGroups[team].GD6;
      remainingGD7 -= assignedGroups[team].GD7;
      remainingGD14 -= assignedGroups[team].GD14;
      remainingGN22 -= assignedGroups[team].GN22;
      remainingWomenGD14 -= assignedGroups[team].GD14_Women;
      remainingWomenGN22 -= assignedGroups[team].GN22_Women;
    });

    // Korekta niedoborów
    const distributeRemaining = (type, remaining) => {
      while (remaining > 0) {
        teams.forEach((team) => {
          if (remaining > 0) {
            assignedGroups[team][type] += 1;
            remaining--;
          }
        });
      }
    };

    distributeRemaining("GD6", remainingGD6);
    distributeRemaining("GD7", remainingGD7);
    distributeRemaining("GD14", remainingGD14);
    distributeRemaining("GN22", remainingGN22);
    distributeRemaining("GD14_Women", remainingWomenGD14);
    distributeRemaining("GN22_Women", remainingWomenGN22);

    // Wyświetlenie wyników
    let resultHTML = "<h2>📊 Przydział grup</h2>";
    teams.forEach((team) => {
      resultHTML += `
            <h3>${team.toUpperCase()}</h3>
            <p>GD6: ${assignedGroups[team].GD6}</p>
            <p>GD7: ${assignedGroups[team].GD7}</p>
            <p>GD14: ${assignedGroups[team].GD14} (w tym kobiet: ${
        assignedGroups[team].GD14_Women
      })</p>
            <p>GN22: ${assignedGroups[team].GN22} (w tym kobiet: ${
        assignedGroups[team].GN22_Women
      })</p>
        `;
    });

    document.getElementById("result").innerHTML = resultHTML;
  });

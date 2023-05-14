
// all tournaments
const tournaments = [hfs23, hfs22, mixup22, pbn3, pbn2, pbn1, judgement2, judgement1, saf19, stunfest22];

// non year-adjusted score of a player at a tournament
function base_score_player_tournament (player_name, tournament) {
    const results = tournament["results"];
    var player_rank = results[player_name];
    if (player_rank == null) {
        return 0; // the player did not place in that tournament
    }
    // getting the amount of points corresponding to that place in that tournament type
    var points = {};
    if (tournament["type"] == "minor") {
        points = minor_points;
    } 
    else if (tournament["type"] == "major") {
        points = major_points;
    }
    else {
        console.log ("Unknown tournament type");
        return 0;
    }

    const result = points[player_rank];
    if (result == null) {
        console.log ("Invalid player rank");
        return 0;
    }

    return result;
}

// given a score obtained at a given year, computes the adjusted score
function adjust_score_year(score, year) {
    const current_year = new Date().getFullYear();
    const age = current_year - year;
    var multiplicator = year_multiplicator[age];
    if (multiplicator == null) {
        multiplicator = year_multiplicator["other"];
    }
    return multiplicator * score;
}

// year-adjusted score of a player at a tournament
function adjusted_score_player_tournament (player_name, tournament) {
    const score = base_score_player_tournament(player_name, tournament);
    return adjust_score_year(score, tournament["year"]);
}


// comparing the results of a player to order them
function compare_results(a,b) {
    if (a[0] > b[0]) {        
        return -1;
    }
    return 1;
}

// finds all score, accross all tournaments, of a player
// each score is associated with the corresponding tournament
// the final list is sorted
function all_scores (player_name) {
    var results = [];
    for (const tnmt of tournaments) {
        const score = adjusted_score_player_tournament(player_name,tnmt);
        if (score > 0) {
            results.push([score,tnmt]); // adding the results
        }
    }
    return results.sort(compare_results);
}


// total score of a player accross all tournaments
// with weihgted results
function total_score (player_name) {
    const results = all_scores (player_name);
    var total = 0;
    for (var i=0; i<best_results; i++) {
        if (results[i] != null) {
            total += results[i][0] * best_multiplicator[i];
        }
    }
    return total;
}


// getting all players that ever got a rank in a tournament
function get_players () {
    var players = new Set();
    for (const tnmt of tournaments) {
        var results = tnmt["results"];
        for (const [player, rank] of Object.entries(results)) {
            players.add(player);
        }
    }
    return players;
}

// comparing the total score of two players
function compare_rankings(a,b) {
    if (a[1] > b[1]) {        
        return -1;
    }
    return 1;
}

// returning the sorted list of the total scores of all players
function rank_all_players() {
    const players = get_players();
    var rankings = [];
    for (const player of players) {
        var score = total_score(player);
        rankings.push([player,score]);
    }
    return rankings.sort(compare_rankings);
}


function draw_list() {
    const ranklist = document.getElementById("rankings");
    console.log(ranklist);
    const rankings = rank_all_players();
    for (var i=0; i<rankings.length; i++) {
        var entry = rankings[i];
        let li = document.createElement("li");
        li.innerText = (i+1).toString();
        li.innerText += ") ";
        li.innerText += entry[0];
        li.innerText += " - ";
        li.innerText += entry[1].toString();
        li.innerText += "pts";
        ranklist.appendChild(li);
    }
}

console.log(rank_all_players());

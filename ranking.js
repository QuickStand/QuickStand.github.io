
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

// getting the rank of a player
function get_rank(player_name) {
    const rankings = rank_all_players();
    for (var i=0; i<rankings.length; i++) {
        ps = rankings[i];
        if (ps[0] == player_name) {
            return (i+1).toString();
        }
    }
    return "None";
}



// Produces html link to bracket
function html_link(url,name) {
    if (url == null || url == "") { return name; } // broken links
    return "<a href='" + url + "'>" + name + "</a>";
}

// linking to the personal page of each player
function player_link(player_name) {
    return html_link("3rdplayer.html?p="+player_name, player_name);
}

// linking to each tournament page
function tournament_link(tournament) {
    return html_link("3rdtournament.html?t="+tournament["shortname"], tournament["name"]);
}


// drawing the full ranking list
function draw_list() {
    const ranklist = document.getElementById("rankings");
    console.log(ranklist);
    const rankings = rank_all_players();
    for (var i=0; i<rankings.length; i++) {
        var entry = rankings[i];
        let li = document.createElement("li");
        li.innerHTML = (i+1).toString();
        li.innerHTML += ") ";
        li.innerHTML += player_link(entry[0].toString());
        li.innerHTML += " - ";
        li.innerHTML += entry[1].toString();
        li.innerHTML += "pts";
        ranklist.appendChild(li);
    }
}

// drawing the player card on 3rdplayer.html
function draw_player(player_name) {
    const p_name = document.getElementById("p_name");
    p_name.innerHTML = player_name;
    const score = all_scores(player_name);
    // drawing the achievement list
    if (score.length > 0) {
        t_achievements = document.getElementById("t_achievements");
        t_achievements.innerHTML = "Achievements:";
        p_achievements = document.getElementById("p_achievements");
        for (var i=0; i<best_results; i++) {
            const result = score[i];
            if (result != null) {
                const r_tournament = result[1];
                const r_score = result[0];
                const r_rank = r_tournament["results"][player_name];
                let li = document.createElement("li");
                li.innerHTML = "#" + r_rank.toString() + " - ";
                li.innerHTML += tournament_link(r_tournament) + " - " + r_score.toString() + "pts"; 
                p_achievements.appendChild(li);
            }
        }
    }
    // drawing the other results
    if (score.length >3) {
        t_others = document.getElementById("t_others");
        t_others.innerHTML = "Other Results:";
        p_others = document.getElementById("p_others");
        for (var i=3; i<score.length; i++) {
            const result = score[i];
            const r_tournament = result[1];
            const r_score = result[0];
            const r_rank = r_tournament["results"][player_name];
            let li = document.createElement("li");
            li.innerHTML = "#" + r_rank.toString() + " - ";
            li.innerHTML += tournament_link(r_tournament) + " - " + r_score.toString() + "pts"; 
            p_others.appendChild(li);
        }
    }
    // drawing total score
    p_total = document.getElementById("p_total");
    p_total.innerHTML = "Total Score: " + total_score(player_name).toString() + "pts";
    // drawng total ranking
    p_ranking = document.getElementById("p_ranking");
    p_ranking.innerHTML = "Total Ranking: #" + get_rank(player_name);
}

// drawing depending on the url argument
function draw_player_url () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const player_name = urlParams.get("p");
    if (player_name != null) {
        draw_player(player_name);
    }
    return 0;
}


// printing the tournament type
function type_to_string(type) {
    if (type == "major") { return "Major Tournament"; }
    else if (type == "minor") { return "Minor Tournament"; }
    return "";
}

// prints the HTML links for a list of organizers
function print_orgs (orgs, orgs_links) {
    var links = "";
    for (var i=0; i<orgs.length; i++) {
        links += html_link(orgs_links[i],orgs[i]) + " ";
    }
    return links;
}


// drawing the tournament page
function draw_tournament(tournament) {
    document.getElementById("name").innerHTML = tournament["name"];
    document.getElementById("type").innerHTML = type_to_string(tournament["type"]);
    document.getElementById("date").innerHTML = tournament["month"] + " " + tournament["year"];
    document.getElementById("org").innerHTML = print_orgs(tournament["org"],tournament["org_link"]);
    document.getElementById("bracket").innerHTML = html_link(tournament["bracket"],"Bracket");
    if (tournament["vod"] != null) {document.getElementById("vod").innerHTML = html_link(tournament["vod"],"VOD");}
    if (tournament["note"] != null) {document.getElementById("note").innerHTML = tournament["note"];}
    const results = document.getElementById("results");
    
    // print the result list
    for (const player_name in tournament["results"]) {
        let li = document.createElement("li");
        li.innerHTML = "#" + tournament["results"][player_name] + " - " + player_link(player_name);
        results.appendChild(li);
    }
}

// drawing tournament depending on the url argument
function tournament_url () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const param = urlParams.get("t");
    if (param != null) {
        for (const t of tournaments) {
            if (param == t["shortname"]) {
                draw_tournament(t);
            }
        }
    }
    return 0;
}
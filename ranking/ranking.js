
// all tournaments
// ordered from most recent to oldest
const tournaments = [hfs23, mixup22, hfs22, stunfest22, judgement2, pbn3, judgement1, saf19, pbn2, pbn1];

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

// flag emojis 
function getflag(langcode) {
	var first = langcode.charCodeAt(0) + 127397;
	var second = langcode.charCodeAt(1) + 127397;
	var flag=`&#${first};&#${second};`;
	return flag;
}

// a string containing all flags of a player
function player_flags(player_name) {
    const profile = profiles[player_name];
    if (profile == null) { return ""; }
    const countries = profile["country"];;
    if (countries == null) { return ""; }
    var flags = "";
    for (const ctr of countries) {
        flags += getflag(ctr) + " ";
    }
    return flags;
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

// printing ordinal rankings
// 1 becomes 1st, 3 becomes 3rd...
function ordinal (rank) {
    const last = rank % 10;
    const lasttwo = rank % 100;
    if (last == 1 && lasttwo != 11) { return rank + "st"; }
    if (last == 2 && lasttwo != 12) { return rank + "nd"; }
    if (last == 3 && lasttwo != 13) { return rank + "rd"; }
    return rank + "th";

}


// drawing the full ranking list
function draw_list() {
    const ranklist = document.getElementById("rankings");
    const rankings = rank_all_players();
    for (var i=0; i<rankings.length; i++) {
        const entry = rankings[i];
        let tr = document.createElement("tr");
        tr.setAttribute("id",(i+1).toString())
        let td_rank = document.createElement("td");
        td_rank.innerHTML =  (i+1).toString();
        tr.appendChild(td_rank);
        let td_country = document.createElement("td");
        td_country.innerHTML = player_flags(entry[0].toString());
        tr.appendChild(td_country);
        let td_name = document.createElement("td");
        td_name.innerHTML = player_link(entry[0].toString());
        tr.appendChild(td_name);
        let td_points = document.createElement("td");
        td_points.innerHTML = entry[1].toString() + " pts";
        tr.appendChild(td_points);
        ranklist.appendChild(tr);
    }
}

// drawing the player card on 3rdplayer.html
function draw_player(player_name) {
    const p_name = document.getElementById("p_name");
    p_name.innerHTML = player_flags(player_name) + player_name;
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
                let tr = document.createElement("tr");
                let td_rank = document.createElement("td");
                td_rank.innerHTML = ordinal(r_rank.toString());
                tr.appendChild(td_rank);
                let td_tournament = document.createElement("td");
                td_tournament.innerHTML = tournament_link(r_tournament);
                tr.appendChild(td_tournament);
                let td_points = document.createElement("td");
                td_points.innerHTML = r_score.toString() + " pts"; 
                tr.appendChild(td_points);
                p_achievements.appendChild(tr);
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
            let tr = document.createElement("tr");
            let td_rank = document.createElement("td");
            td_rank.innerHTML = ordinal(r_rank.toString());
            tr.appendChild(td_rank);
            let td_tournament = document.createElement("td");
            td_tournament.innerHTML = tournament_link(r_tournament);
            tr.appendChild(td_tournament);
            let td_points = document.createElement("td");
            td_points.innerHTML = r_score.toString() + " pts"; 
            tr.appendChild(td_points);
            p_others.appendChild(tr);
            
        }
    }
    // drawing total score
    p_total = document.getElementById("p_total");
    p_total.innerHTML = "Total Score: " + total_score(player_name).toString() + " pts";
    // drawng total ranking
    p_ranking = document.getElementById("p_ranking");
    const rank = get_rank(player_name);
    p_ranking.innerHTML = "Total Ranking: #" + html_link("3rdrankings.html#"+rank,rank);
    // drawing the quote
    const quote = profiles[player_name]["quote"];
    if (quote != null) {
        document.getElementById("quote").innerHTML = "\"" + quote + "\"";
    }
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
    const orgs = print_orgs(tournament["org"],tournament["org_link"]);
    if (orgs != "") {
        document.getElementById("t_org").innerHTML = "Organizer: ";
        document.getElementById("org").innerHTML = orgs; }
    document.getElementById("bracket").innerHTML = html_link(tournament["bracket"],"Bracket");
    if (tournament["vod"] != null) {document.getElementById("vod").innerHTML = html_link(tournament["vod"],"VOD");}
    if (tournament["note"] != null) {document.getElementById("note").innerHTML = tournament["note"];}
    const results = document.getElementById("results");
    
    // print the result list
    for (const player_name in tournament["results"]) {
        let tr = document.createElement("tr");
        let td_rank = document.createElement("td");
        td_rank.innerHTML = ordinal(tournament["results"][player_name]);
        tr.appendChild(td_rank);
        let td_player = document.createElement("td");
        td_player.innerHTML = player_link(player_name);
        tr.appendChild(td_player);
        let td_flag = document.createElement("td");
        td_flag.innerHTML = player_flags(player_name);
        tr.appendChild(td_flag);
        
        results.appendChild(tr);
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

// drawing the tournament list
function draw_tournaments() {
    const event_list = document.getElementById("event_list");
    for (const event of tournaments) {
        let li = document.createElement("li");
        li.innerHTML = tournament_link(event);
        event_list.appendChild(li);
    }
    return 0;
}

// drawing quickstand events only
function draw_quickstand_tournaments() {
    const quickstand_list = document.getElementById("quickstand_list");
    for (const event of tournaments) {
        if (event["org"].includes("QuickStand")) {
            let li = document.createElement("li");
            li.innerHTML = html_link("ranking/3rdtournament.html?t="+event["shortname"], event["name"]);
            quickstand_list.appendChild(li);
        }
    }
    return 0;
}
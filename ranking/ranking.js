
// all tournaments
// ordered from most recent to oldest
const tournaments = [hfs24, judgement3, tsb23, hfs23, mixup22, hfs22, stunfest22, judgement2, pbn3, hfsreborn, judgement1, saf19, hfs19, stunfest19, p2p, pbn2, hfs18, pax18, pbn1, hfs17, kots2, kots1];
const nonranked_tournaments = [basf21, stunfest18, stunfest16, stunfest15, stunfest14];
const all_tournaments = tournaments.concat(nonranked_tournaments);

// filter tournaments based on the following possible modes
// - solo -> to get the solo rankings, consider every possible tournament (even nonranked)
// - team -> only get the tournaments with team results
// - 2019 (or any other year) -> only tournments for that given year
function get_tournaments(mode) {
    if (mode == "solo") { return all_tournaments; }
    if (mode == "team") { return all_tournaments.filter((tnmt) => tnmt["team_results"] != null); }
    return all_tournaments.filter((tnmt) => Number(tnmt["year"]) == Number(mode));
}

// returns the set of all years where we have some SOLO tournament results
function all_years() {
    var years = new Set();
    for (const tnmt of tournaments) {
        years.add(tnmt["year"]);
    }
    return Array.from(years).sort((a,b) => Number(b) - Number(a));
}


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
    else if (tournament["type"] == "single") {
        points = single_points;
    }
    else if (tournament["type"] == "nonranked") {
        return 0;
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
function all_scores (player_name, mode) {
    var results = [];
    const mode_tournaments = get_tournaments(mode);
    for (const tnmt of mode_tournaments) {
        if (tnmt["results"] != null) {
            const score = adjusted_score_player_tournament(player_name,tnmt);
            if (score > 0) {
                results.push([score,tnmt]); // adding the results
            }
        }
    }
    return results.sort(compare_results);
}

// returns the team tournaments medals
// gold medals at index 0 and so on
function team_medals (player_name) {
    var medals = [0,0,0];
    // looking at all tournaments
    for (const tnmt of get_tournaments("team")) {
        const team_results = tnmt["team_results"];
        if (team_results != null) {
            const rank = team_results[player_name];
            if (rank != null & rank <=3) {
                medals[rank-1] = medals[rank-1] + 1;;
            }
        }
    }
    return medals;
}

// just checks that there are some medals to display
function has_medals(medals) {
    return (medals[0] != 0 || medals[1] != 0 || medals[2] != 0);
}

// creating a string of emojis for medals
function print_medals(medals) {
    var str = "";
    for (var i=0; i<medals[0]; i++) { str += "🥇"; }
    for (var i=0; i<medals[1]; i++) { str += "🥈"; } 
    for (var i=0; i<medals[2]; i++) { str += "🥉"; }
    return str;
}

// compare two sets of medal: lexicographic order
function compare_medals(m1, m2) {
    if (m1[0] > m2[0]) { return -1; }
    if (m2[0] > m1[0]) { return 1; }
    if (m1[1] > m2[1]) { return -1; }
    if (m2[1] > m1[1]) { return 1; }
    if (m1[2] > m2[2]) { return -1; }
    if (m2[2] > m1[2]) { return 1; }
    return 0;
}

// comparing nonranked results: best rank first
function compare_nonranked(a,b) {
    if (Number(a[0]) > Number(b[0])) {        
        return 1;
    }
    return -1;
}

// finds all results in nonranked tournaments (eg team)
function nonranked_scores (player_name) {
    var results = [];
    // team tournaments of ranked tournaments
    for (const tnmt of tournaments) {
        const team_results = tnmt["team_results"];
        if (team_results != null) {
            if (team_results[player_name] != null) {
                results.push([team_results[player_name],tnmt," - Team","#t_team"]);
            }
        }
    }
    // nonranked tournaments
    for (const tnmt of nonranked_tournaments) {
        // solo
        const solo_results = tnmt["results"];
        if (solo_results != null) {
            if (solo_results[player_name] != null) {
                results.push([solo_results[player_name],tnmt,"",""]);
            }
        }
        // team
        const team_results = tnmt["team_results"];
        if (team_results != null) {
            if (team_results[player_name] != null) {
                results.push([team_results[player_name],tnmt," - Team","#t_team"]);
            }
        }
    }
    return results.sort(compare_nonranked);
}

// total score of a player accross all tournaments
// with weihgted results
function total_score (player_name, mode) {
    const results = all_scores (player_name, mode);
    var total = 0;
    for (var i=0; i<best_results; i++) {
        if (results[i] != null) {
            total += results[i][0] * best_multiplicator[i];
        }
    }
    return total;
}


// getting all players that ever got a rank in a tournament
function get_players (mode) {
    var players = new Set();
    var mode_tournaments = get_tournaments(mode);
    // for each tournaments
    for (const tnmt of mode_tournaments) {
        // solo
        var results = tnmt["results"];
        if (results != null && mode !== "team") { 
            // for the team rankings, we only want to see players with medals
            // while for solo rankings, we can display everyone
            for (const [player, rank] of Object.entries(results)) {
                players.add(player);
            }
        }
        // team
        var team_results = tnmt["team_results"];
        if (team_results != null) {
            for (const [player,rank] of Object.entries(team_results)) {
                players.add(player);
            }
        }
    }
    return players;
}

// all players that have a profile
// even if they don't have any results
function get_players_with_profile() {
    return new Set(Object.keys(profiles));
}


// returning the sorted list of the total scores of all players
// each element of the list contains
// 0. the player name
// 1. the player total score
// 2. the player rank (might not be the list index because of ties)
function rank_all_players(mode) {
    const players = get_players(mode);
    var rankings = [];
    for (const player of players) {
        var score = null;
        if (mode == "team") {
            score = team_medals(player);
        } else {
            score = total_score(player,mode);
        }
        rankings.push([player,score,0]);
    }
    if (mode == "team") {
        rankings = rankings.sort((a,b) => compare_medals(a[1],b[1]));
    } else {
        rankings = rankings.sort((a,b) => b[1] - a[1]);
    }
    // adding the ranks and handling the ties
    var previous_score = -1; // score of the previous player
    var current_rank = 0;
    var next_rank = 1; // next rank if the score is different
    for (player of rankings) {
        if (player[1] == previous_score) {
            player[2] = current_rank;
            next_rank = next_rank + 1;
        }
        else {
            player[2] = next_rank;
            previous_score = player[1];
            current_rank = next_rank;
            next_rank = current_rank + 1;
        }
    }
    return rankings;
}

// getting the solo rank of a player
function get_rank(player_name) {
    const rankings = rank_all_players("solo");
    for (player of rankings) {
        if (player[0] == player_name) {
            return (player[2]).toString();
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

// getting the player name from a startgg id
function get_name_from_startgg(startid) {
    for (const [name,profile] of Object.entries(profiles)) {
        let player_start = profile["startgg"];
        if (player_start != null && player_start == startid) {
            return name;
        }
    }
    return null;
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

// printing the tournament type
function type_to_string(type) {
    if (type == "major") { return "Major Tournament"; }
    else if (type == "minor") { return "Minor Tournament"; }
    else if (type == "single") { return "Single-Elimination Tournament"; }
    else if (type == "nonranked") { return "Non-ranked Tournament"; }
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

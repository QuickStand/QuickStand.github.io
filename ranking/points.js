// points given to each specific rank in a Super major tournament
const super_major_points = {
    "1":"178",
    "2":"167",
    "3":"158",
    "4":"150",
    "5":"136",
    "7":"124",
    "9":"104",
    "13":"88",
    "17":"64",
    "25":"48",
    "33":"32"
}

// points given to each specific rank in a major tournament
const major_points = {
    "1":"162",
    "2":"151",
    "3":"142",
    "4":"134",
    "5":"120",
    "7":"108",
    "9":"88",
    "13":"72",
    "17":"48",
    "25":"32"
};

// points given to each specific rank in a minor tournament
const minor_points = {
    "1":"123",
    "2":"113",
    "3":"105",
    "4":"98",
    "5":"86",
    "7":"76",
    "9":"60",
    "13":"48",
    "17":"32"
};

const single_points = {
    "1":"151",
    "2":"144",
    "3":"132",
    "4":"132",
    "5":"112",
    "9":"80",
    "17":"32"
};

// how much to multiply a score with depending on how many years have passed since the result
const year_multiplicator = {
    "0":"15",
    "1":"14",
    "2":"13",
    "3":"12",
    "4":"11",
    "other":"10"
};

// for now, we only take into account the 3 best results of each player
const best_results = 3;

// multiplicators for each results. For instance, the best result is multiplied by 5
const best_multiplicator = {
    "0":"5",
    "1":"3",
    "2":"2"
};
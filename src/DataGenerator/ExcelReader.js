import * as XLSX from "xlsx";

const matchTemplate = {
  home: "",
  away: "",
  location: "",
  time: "",
  date: ""
};

const myExlusionFilter = (row) => {
  const excludedTeams = ["FC Twenty 11", "FC Twenty 11 Reserves"]; // List of teams to exclude
  return (
    !excludedTeams.includes(row["Home team"]) &&
    !excludedTeams.includes(row["Away team"])
  );
};

const myFilter = (row) =>
  (row["Home team"] && row["Home team"].includes("FC Twenty 11")) ||
  (row["Away team"] && row["Away team"].includes("FC Twenty 11"));

const groupByCompetition = (rows) => {
  return rows.reduce(
    (acc, row) => {
      const comp = row["Competition"]?.toLowerCase() || "";

      const datetime = row["Date/time"];
      const [day, month, yearAndTime] = datetime.split('/');
      const [year, time] = yearAndTime.split(' ');
      const isoString = `${year}-${month}-${day}T${time}:00`; // Convert to ISO format
      const dateObj = new Date(isoString);
      
      const datePart = dateObj.toLocaleDateString('en-NZ'); // e.g., "26/04/2025"
      const timePart = dateObj.toLocaleTimeString('en-NZ', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // 24-hour format
      }); // e.g., "09:15" or "21:15"

      const match = {
        ...matchTemplate,
        home:  row["Home team"],
        away:  row["Away team"],
        location: row["Field"],
        time: timePart,
        date: datePart
      };
      
      if (
        ["19", "18", "17", "16", "15", "14", "13"].some((num) =>
          comp.includes(num)
        )
      ) {
        acc.youths.push(match);
      } else if (["12", "11"].some((num) => comp.includes(num))) {
        acc.juniors1.push(match);
      } else if (["10", "9"].some((num) => comp.includes(num))) {
        acc.juniors2.push(match);
      } else if (comp.includes("masters")) {
        acc.masters.push(match);
      } else {
        acc.seniors.push(match);
      }

      return acc;
    },
    {
      youths: [],
      juniors1: [],
      juniors2: [],
      seniors: [],
      masters: [],
    }
  );
};

export const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      try {
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0]; // Get the first sheet
        const ws = wb.Sheets[wsname];
        let jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" }); // Convert to JSON

        // Apply exclusion filter
        if (myExlusionFilter && typeof myExlusionFilter === "function") {
          jsonData = jsonData.filter(myExlusionFilter);
        }

        // Apply filter
        if (myFilter && typeof myFilter === "function") {
          jsonData = jsonData.filter(myFilter);
        }

        const grouped = groupByCompetition(jsonData);

        resolve(grouped);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file); // Read the file
  });
};

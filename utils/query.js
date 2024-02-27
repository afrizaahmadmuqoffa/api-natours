exports.sqlQuery = (year) => {
    return `
        SELECT
        EXTRACT(MONTH FROM startedDate) AS bulan,
        COUNT(*) AS jumlah_tur,
        GROUP_CONCAT(name_dest ORDER BY startedDate) AS nama_tur
        FROM (
            SELECT id, name_dest, startedDate_1 AS startedDate FROM tours
            UNION ALL
            SELECT id, name_dest, startedDate_2 AS startedDate FROM tours
            UNION ALL
            SELECT id, name_dest, startedDate_3 AS startedDate FROM tours
            ) AS combined_dates
            WHERE
        startedDate BETWEEN '${year}-01-01' AND '${year}-12-31'
        GROUP BY
        bulan
        ORDER BY
        bulan;
        `
}
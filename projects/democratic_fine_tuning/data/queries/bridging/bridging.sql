SELECT DISTINCT
    A.id AS A_id,
    A.title as A_title,
    B.id AS B_id,
    B.title as B_title,
    C.id AS C_id,
    C.title as C_title,
    VA.id as VA_id,
    VB.id as VB_id
  FROM
      "CanonicalValuesCard" A
  JOIN
      "Edge" E1 ON A.id = E1."fromId"
  JOIN
      "CanonicalValuesCard" C ON E1."toId" = C.id
  JOIN
      "Demographic" DA ON E1."userId" = DA."userId"
  JOIN
      "CanonicalValuesCard" B ON A.id != B.id
  JOIN
      "Edge" E2 ON B.id = E2."fromId" AND E2."toId" = C.id
  JOIN
      "Demographic" DB ON E2."userId" = DB."userId"
  JOIN
    "Vote" VA ON VA."userId" = DA."userId"
  JOIN
    "Vote" VB on VB."userId" = DB."userId"
  WHERE
      DA."usPoliticalAffiliation" = 'Republican'
  AND
      DB."usPoliticalAffiliation" = 'Democrat'
  AND
    VA."valuesCardId" = A.id
  AND
    VB."valuesCardId" = B.id
  ORDER BY C_id

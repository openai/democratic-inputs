from typing import List, Tuple
from gurobipy import Model, GRB, quicksum, setParam


def optimize_monroe_matching(utilities: List[List[int]]) -> Tuple[int]:
    """Function to compute the optimal assignment of agents to statements using integer linear programming, to maximize
    the Monroe value.

    Args:
    utilities (List[List[int]]): n x m Utility-Matrix. `utilities[i][j]` indicate the utility of agent `i` for statement `j`.

    Returns:
    Tuple[int]: A tuple of length n, whose i’th entry is a number 0≤j<m indicating which statement agent i is assigned to.
    """

    n = len(utilities)
    m = len(utilities[0])
    assert (
        n % m == 0
    ), "The number of agents (rows) must be a multiple of the number of statements (columns)."

    k = n // m
    model = Model()

    # a two-dimensional list of binary variables, where variables[i][j] will indicate whether agent i is assigned to statement j.
    variables = [[model.addVar(vtype=GRB.BINARY) for _ in range(m)] for _ in range(n)]

    model.update()

    # objective function
    model.setObjective(
        quicksum(utilities[i][j] * variables[i][j] for i in range(n) for j in range(m)),
        GRB.MAXIMIZE,
    )

    # constraints: each agent is assigned to exactly one statement.
    for i in range(n):
        model.addConstr(quicksum(variables[i]) == 1)

    # constraints: each statement is assigned to exactly k agents.
    for j in range(m):
        model.addConstr(quicksum(variables[i][j] for i in range(n)) == k)

    model.optimize()
    assert model.status == GRB.OPTIMAL or model.status == GRB.SUBOPTIMAL

    assignments = [-1] * n
    for i in range(n):
        for j in range(m):
            if round(variables[i][j].X) == 1:
                assert assignments[i] == -1
                assignments[i] = j
    assert all(x != -1 for x in assignments)

    return tuple(assignments)


if __name__ == "__main__":
    setParam("OutputFlag", False)
    assert optimize_monroe_matching([[1, 3], [3, 4], [5, 6], [8, 10]]) == (1, 0, 0, 1)

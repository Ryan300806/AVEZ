export interface AllocationInput {
    ticker: string;
    companyName: string;
    score: number;
    dividendYield: number;
}

export interface AllocationOutput {
    ticker: string;
    companyName: string;
    score: number;
    allocationAmount: number;
    dividendYield: number;
}

export function allocateBudget(
    budget: number,
    companies: AllocationInput[]
): AllocationOutput[] {
    if (budget < 0) {
        throw new Error("Budget tidak boleh negatif");
    }

    if (companies.length === 0) {
        return [];
    }

    const totalScore = companies.reduce(
        (total, company) =>
            total + Math.max(0, company.score),
        0
    );

    if (totalScore === 0) {
        return companies.map((company) => ({
            ticker: company.ticker,
            companyName: company.companyName,
            score: company.score,
            allocationAmount: 0,
            dividendYield: company.dividendYield,
        }));
    }

    const allocations: AllocationOutput[] = [];

    let allocatedAmount = 0;

    for (let i = 0; i < companies.length; i++) {
        const company = companies[i];

        const isLast = i === companies.length - 1;

        let allocationAmount: number;

        if (isLast) {
            allocationAmount = budget - allocatedAmount;
        } else {
            allocationAmount = Math.round(
                (Math.max(0, company.score) / totalScore) *
                    budget
            );
        }

        allocatedAmount += allocationAmount;

        allocations.push({
            ticker: company.ticker,
            companyName: company.companyName,
            score: company.score,
            allocationAmount,
            dividendYield: company.dividendYield,
        });
    }

    return allocations;
}
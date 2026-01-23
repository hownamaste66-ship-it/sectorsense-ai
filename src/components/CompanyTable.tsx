import type { Company } from '@/types/industry';
import { formatMarketCap, formatPercentage, getRiskLabel } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface CompanyTableProps {
  companies: Company[];
  isLoading?: boolean;
}

export function CompanyTable({ companies, isLoading }: CompanyTableProps) {
  if (isLoading) {
    return (
      <div className="glass-card p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">No companies found in this industry.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-muted-foreground">Company</TableHead>
            <TableHead className="text-muted-foreground text-right">Market Cap</TableHead>
            <TableHead className="text-muted-foreground text-right">P/E Ratio</TableHead>
            <TableHead className="text-muted-foreground text-right">1Y Return</TableHead>
            <TableHead className="text-muted-foreground text-right">Revenue</TableHead>
            <TableHead className="text-muted-foreground text-right">Risk</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company, index) => {
            const risk = getRiskLabel(company.risk_score);
            const returnValue = company.return_1y;

            return (
              <TableRow
                key={company.id}
                className="border-border/50 hover:bg-muted/30 fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{company.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{company.ticker}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatMarketCap(company.market_cap)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {company.pe_ratio ? company.pe_ratio.toFixed(1) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {returnValue !== null && (
                      <>
                        {returnValue > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-success" />
                        ) : returnValue < 0 ? (
                          <ArrowDownRight className="h-4 w-4 text-destructive" />
                        ) : (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </>
                    )}
                    <span
                      className={cn(
                        'font-mono text-sm',
                        returnValue !== null && returnValue > 0
                          ? 'text-success'
                          : returnValue !== null && returnValue < 0
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                      )}
                    >
                      {formatPercentage(returnValue)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatMarketCap(company.revenue)}
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn('text-sm font-medium', risk.color)}>
                    {risk.label}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

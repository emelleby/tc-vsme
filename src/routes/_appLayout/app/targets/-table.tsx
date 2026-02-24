import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import type { EmissionRow } from './-schemas'

const columnHelper = createColumnHelper<EmissionRow>()

/**
 * Column definitions for the emissions table
 */
export const columns = [
	columnHelper.accessor('year', {
		header: 'Year',
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor('scope1', {
		header: 'Scope 1',
		cell: (info) => info.getValue().toLocaleString(),
	}),
	columnHelper.accessor('scope2', {
		header: 'Scope 2',
		cell: (info) => info.getValue().toLocaleString(),
	}),
	columnHelper.accessor('scope3', {
		header: 'Scope 3',
		cell: (info) => info.getValue().toLocaleString(),
	}),
	columnHelper.accessor('total', {
		header: 'Total Emissions',
		cell: (info) => info.getValue().toLocaleString(),
	}),
]

interface EmissionsTableProps {
	data: EmissionRow[]
}

/**
 * Table component for displaying emission projections
 */
export function EmissionsTable({ data }: EmissionsTableProps) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		filterFns: {
			fuzzy: () => true,
		},
	})

	return (
		<div className="rounded-md border">
			<table className="w-full text-sm">
				<thead className="bg-muted/50">
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									className="h-10 px-4 text-left align-middle font-medium text-muted-foreground"
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody className="divide-y">
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id} className="hover:bg-muted/50">
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="p-4 align-middle">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

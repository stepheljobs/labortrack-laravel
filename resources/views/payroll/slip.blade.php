<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payroll Slip - {{ $entry->labor->name }}</title>
    <style>
        @media print {
            body {
                margin: 0;
                padding: 0;
                font-family: 'Arial', sans-serif;
                font-size: 12px;
                line-height: 1.4;
            }
            
            .no-print {
                display: none !important;
            }
            
            .page-break {
                page-break-after: always;
            }
            
            .payroll-slip {
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
        }
        
        @media screen {
            body {
                margin: 20px;
                font-family: 'Arial', sans-serif;
                font-size: 12px;
                line-height: 1.4;
                background: #f5f5f5;
            }
            
            .payroll-slip {
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .document-title {
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0;
            text-transform: uppercase;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .info-section {
            border: 1px solid #ddd;
            padding: 15px;
        }
        
        .info-section h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        
        .info-label {
            font-weight: bold;
        }
        
        .pay-details {
            margin-bottom: 30px;
        }
        
        .pay-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .pay-table th,
        .pay-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        .pay-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        
        .pay-table .text-right {
            text-align: right;
        }
        
        .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
        }
        
        .attendance-details {
            margin-top: 30px;
        }
        
        .attendance-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }
        
        .attendance-table th,
        .attendance-table td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
        }
        
        .attendance-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        
        .attendance-table .text-right {
            text-align: right;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 11px;
            color: #666;
        }
        
        .signature-section {
            margin-top: 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        
        .signature-box {
            text-align: center;
        }
        
        .signature-line {
            border-bottom: 1px solid #333;
            margin: 40px 0 10px 0;
            height: 1px;
        }
        
        .print-button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-bottom: 20px;
        }
        
        .print-button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="payroll-slip">
        <button class="print-button no-print" onclick="window.print()">
            🖨️ Print Payroll Slip
        </button>
        
        <!-- Header -->
        <div class="header">
            <div class="company-name">{{ $company['name'] }}</div>
            <div>{{ $company['address'] }}</div>
            <div>{{ $company['phone'] }} | {{ $company['email'] }}</div>
        </div>
        
        <!-- Document Title -->
        <div class="document-title">Payroll Slip</div>
        
        <!-- Employee and Period Information -->
        <div class="info-grid">
            <div class="info-section">
                <h3>Employee Information</h3>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span>{{ $entry->labor->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Employee ID:</span>
                    <span>#{{ str_pad($entry->labor->id, 6, '0', STR_PAD_LEFT) }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Daily Rate:</span>
                    <span>₱{{ number_format($entry->labor->daily_rate, 2) }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Project:</span>
                    <span>{{ $entry->project->name ?? 'N/A' }}</span>
                </div>
            </div>
            
            <div class="info-section">
                <h3>Payroll Period</h3>
                <div class="info-row">
                    <span class="info-label">Period:</span>
                    <span>{{ $entry->payrollRun->period_label }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Start Date:</span>
                    <span>{{ \Carbon\Carbon::parse($entry->payrollRun->start_date)->format('M d, Y') }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">End Date:</span>
                    <span>{{ \Carbon\Carbon::parse($entry->payrollRun->end_date)->format('M d, Y') }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span>{{ ucfirst($entry->payrollRun->status) }}</span>
                </div>
            </div>
        </div>
        
        <!-- Pay Details -->
        <div class="pay-details">
            <h3>Pay Calculation Details</h3>
            <table class="pay-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Hours</th>
                        <th class="text-right">Rate</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Regular Hours</td>
                        <td class="text-right">{{ number_format($entry->regular_hours, 2) }}</td>
                        <td class="text-right">₱{{ number_format($entry->hourly_rate, 2) }}</td>
                        <td class="text-right">₱{{ number_format($entry->regular_pay, 2) }}</td>
                    </tr>
                    @if($entry->overtime_hours > 0)
                    <tr>
                        <td>Overtime Hours</td>
                        <td class="text-right">{{ number_format($entry->overtime_hours, 2) }}</td>
                        <td class="text-right">₱{{ number_format($entry->overtime_rate, 2) }}</td>
                        <td class="text-right">₱{{ number_format($entry->overtime_pay, 2) }}</td>
                    </tr>
                    @endif
                    <tr class="total-row">
                        <td><strong>Total Gross Pay</strong></td>
                        <td class="text-right"><strong>{{ number_format($entry->total_hours, 2) }}</strong></td>
                        <td class="text-right">-</td>
                        <td class="text-right"><strong>₱{{ number_format($entry->total_pay, 2) }}</strong></td>
                    </tr>
                </tbody>
            </table>
            
            <div class="info-grid">
                <div class="info-section">
                    <h3>Work Summary</h3>
                    <div class="info-row">
                        <span class="info-label">Days Worked:</span>
                        <span>{{ $entry->days_worked }} days</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Total Hours:</span>
                        <span>{{ number_format($entry->total_hours, 2) }} hours</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Avg Hours/Day:</span>
                        <span>{{ number_format($entry->average_hours_per_day, 2) }} hours</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Avg Daily Pay:</span>
                        <span>₱{{ number_format($entry->average_daily_pay, 2) }}</span>
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Payment Information</h3>
                    <div class="info-row">
                        <span class="info-label">Gross Pay:</span>
                        <span>₱{{ number_format($entry->total_pay, 2) }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Net Pay:</span>
                        <span>₱{{ number_format($entry->total_pay, 2) }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Pay Date:</span>
                        <span>{{ $entry->payrollRun->approved_at ? \Carbon\Carbon::parse($entry->payrollRun->approved_at)->format('M d, Y') : 'Pending' }}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Attendance Details -->
        @if($entry->attendance_data && count($entry->attendance_data) > 0)
        <div class="attendance-details">
            <h3>Daily Attendance Breakdown</h3>
            <table class="attendance-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th class="text-right">Total Hours</th>
                        <th class="text-right">Clock In</th>
                        <th class="text-right">Clock Out</th>
                        <th class="text-right">Hours</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($entry->attendance_data as $date => $data)
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($date)->format('M d, Y') }}</td>
                        <td class="text-right">{{ number_format($data['total_hours'] ?? 0, 2) }}</td>
                        <td class="text-right">
                            @if(isset($data['records']) && count($data['records']) > 0)
                                {{ \Carbon\Carbon::parse($data['records'][0]['clock_in'])->format('H:i') }}
                            @else
                                -
                            @endif
                        </td>
                        <td class="text-right">
                            @if(isset($data['records']) && count($data['records']) > 0)
                                {{ \Carbon\Carbon::parse(end($data['records'])['clock_out'])->format('H:i') }}
                            @else
                                -
                            @endif
                        </td>
                        <td class="text-right">
                            @if(isset($data['records']) && count($data['records']) > 0)
                                @foreach($data['records'] as $record)
                                    {{ number_format($record['hours'], 2) }}<br>
                                @endforeach
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif
        
        <!-- Signatures -->
        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line"></div>
                <div>Employee Signature</div>
                <div style="font-size: 10px; color: #666; margin-top: 5px;">
                    {{ $entry->labor->name }}
                </div>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <div>Authorized Signature</div>
                <div style="font-size: 10px; color: #666; margin-top: 5px;">
                    @if($entry->payrollRun->approvedBy)
                        {{ $entry->payrollRun->approvedBy->name }}
                    @else
                        Pending Approval
                    @endif
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div>This is a computer-generated payroll slip and does not require a physical signature.</div>
            <div>Generated on: {{ now()->format('M d, Y H:i:s') }}</div>
            <div>For questions, please contact HR at {{ $company['email'] }} or {{ $company['phone'] }}</div>
        </div>
    </div>
</body>
</html>
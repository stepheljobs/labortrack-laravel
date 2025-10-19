<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Supervisor Invitation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #3b82f6;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>You're Invited!</h1>
    </div>
    
    <div class="content">
        <p>Hello {{ $supervisor->name }},</p>
        
        <p>You've been invited to join LaborTrack as a Supervisor. This will allow you to manage projects, monitor attendance, and oversee your team.</p>
        
        <p>To get started, please click the button below to accept your invitation:</p>
        
        @isset($supervisor->invitation_token)
        <center>
            <a href="{{ route('supervisors.accept.invitation', $supervisor->invitation_token) }}" class="button">
                Accept Invitation
            </a>
        </center>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>{{ route('supervisors.accept.invitation', $supervisor->invitation_token) }}</p>
    @else
        <p><strong>Note:</strong> Please contact your administrator for a new invitation link.</p>
    @endisset
        
        <p>This invitation link will expire in 7 days. If you need a new invitation, please contact your administrator.</p>
        
        <p>Once you accept the invitation, you'll be able to log in with your email and the temporary password provided by your administrator.</p>
        
        <p>We look forward to having you on board!</p>
        
        <p>Best regards,<br>The LaborTrack Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>
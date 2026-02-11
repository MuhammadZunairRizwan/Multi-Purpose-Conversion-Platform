# CalNConvert Deployment Memory Bank

## AWS Infrastructure Created

### EC2 Instance
- **Instance ID**: `i-01a247a7fa94cc0b4`
- **Instance Type**: `t3.micro` (Free Tier eligible)
- **Region**: `us-east-1`
- **AMI**: Ubuntu 22.04 LTS (`ami-0030e4319cbf4dbf2`)
- **Public IP**: `54.80.17.59` (Elastic IP)
- **Private IP**: `172.31.31.127`

### Security Group
- **Security Group ID**: `sg-0bd26090698c62d31`
- **Name**: `calnconvert-sg`
- **Inbound Rules**:
  - SSH (22) - 0.0.0.0/0
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0

### Elastic IP
- **Allocation ID**: `eipalloc-0db51d9e59074e36e`
- **Public IP**: `54.80.17.59`
- **Association ID**: `eipassoc-01ed96a165294713e`

### Key Pair
- **Key Name**: `calnconvert-key`
- **Key File Location**: `D:\calnconvert\aws\calnconvert-key.pem`

## AWS Credentials
- **Access Key ID**: `AKIAZOCWRAGHR7CCMMEU`
- **Secret Access Key**: (stored in `D:\calnconvert\aws\Calcnconvert_accessKeys.csv`)
- **Account ID**: `648721531279`
- **IAM User**: `Calcnconvert`

## Server Configuration

### Installed Software
- **Node.js**: v20.19.6
- **Python**: 3.11.0rc1
- **Nginx**: 1.18.0
- **PM2**: 6.0.14
- **Swap**: 2GB (for build process)

### Directory Structure
```
/var/www/calnconvert/
├── backend/
│   ├── venv/           # Python virtual environment
│   ├── main.py
│   ├── routes/
│   └── services/
├── frontend/
│   ├── src/
│   ├── public/
│   └── .next/          # Build output (after successful build)
└── deploy/
    ├── ecosystem.config.js
    ├── nginx.conf
    └── *.sh
```

## SSH Access
```bash
ssh -i D:/calnconvert/aws/calnconvert-key.pem ubuntu@54.80.17.59
```

## Deployment Commands

### Backend
```bash
cd /var/www/calnconvert/backend
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend
```bash
cd /var/www/calnconvert/frontend
npm install
npm run build
```

### Start Services
```bash
pm2 start /var/www/calnconvert/deploy/ecosystem.config.js
pm2 save
```

### Configure Nginx
```bash
sudo cp /var/www/calnconvert/deploy/nginx.conf /etc/nginx/sites-available/calnconvert
sudo ln -s /etc/nginx/sites-available/calnconvert /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## Environment Variables Needed

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
STRIPE_SECRET_KEY=<your-stripe-secret-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
DATABASE_URL=<your-database-url>
```

### Backend (.env)
```
ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
PORT=8000
```

## Domain Configuration

### DNS Records (Add to your domain registrar)
| Type | Name | Value |
|------|------|-------|
| A | @ | 54.80.17.59 |
| A | www | 54.80.17.59 |

### SSL Certificate (After domain is configured)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Useful Commands

### Check Services
```bash
pm2 list
pm2 logs
```

### Restart Services
```bash
pm2 restart all
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### System Memory
```bash
free -h
```

## Cost Estimate
- **EC2 t3.micro**: Free for 12 months (750 hrs/month)
- **EBS 20GB**: Free for 12 months (30 GB included)
- **Elastic IP**: Free while attached to running instance
- **After Free Tier**: ~$10-15/month

## Current Status - DEPLOYED
- **Frontend**: RUNNING at http://54.80.17.59/
- **Backend API**: RUNNING at http://54.80.17.59/api/
- **Nginx**: CONFIGURED (proxying / to frontend, /api to backend)
- **PM2**: Both services running, auto-start on boot enabled

## Remaining Steps (Optional)
1. Point your domain to Elastic IP (54.80.17.59) via DNS A records
2. Install SSL certificate:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
3. Update ALLOWED_ORIGINS in backend .env with your domain
4. Update Clerk webhook URL in Clerk Dashboard

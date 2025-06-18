
import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SecurityMetrics {
  threatLevel: 'low' | 'medium' | 'high';
  activeConnections: number;
  blockedAttempts: number;
  serverLoad: number;
  responseTime: number;
}

const SecurityMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    threatLevel: 'low',
    activeConnections: 0,
    blockedAttempts: 0,
    serverLoad: 0,
    responseTime: 0
  });

  useEffect(() => {
    // Simulate real-time security monitoring
    const interval = setInterval(() => {
      setMetrics({
        threatLevel: Math.random() > 0.95 ? 'high' : Math.random() > 0.8 ? 'medium' : 'low',
        activeConnections: Math.floor(Math.random() * 1000) + 100,
        blockedAttempts: Math.floor(Math.random() * 10),
        serverLoad: Math.floor(Math.random() * 100),
        responseTime: Math.floor(Math.random() * 500) + 50
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Badge variant={getThreatColor(metrics.threatLevel)}>
            {metrics.threatLevel.toUpperCase()}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeConnections}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Blocked Attempts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.blockedAttempts}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitor;

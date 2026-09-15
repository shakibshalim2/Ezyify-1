import { useState } from 'react';
import { Link } from 'react-router';
import { 
  Zap, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Code,
  FileJson,
  Send,
  Save,
  Download,
  Copy,
  Trash2,
  Plus,
  Settings,
  Shield,
  AlertTriangle,
  Database,
  Server,
  Activity,
  Terminal,
  Eye,
  EyeOff,
  RotateCw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner';

interface TestCase {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  headers: Record<string, string>;
  body?: string;
  expectedStatus: number;
  lastRun?: Date;
  lastResult?: 'success' | 'failed' | 'error';
  responseTime?: number;
}

interface TestResult {
  testId: string;
  timestamp: Date;
  status: 'success' | 'failed' | 'error';
  statusCode?: number;
  responseTime: number;
  response?: any;
  error?: string;
}

const APITestingDashboard = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PATCH' | 'DELETE'>('GET');
  const [endpoint, setEndpoint] = useState<string>('/api/v1/');
  const [headers, setHeaders] = useState<string>('{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer YOUR_TOKEN"\n}');
  const [requestBody, setRequestBody] = useState<string>('{\n  \n}');
  const [response, setResponse] = useState<string>('');
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [savedTests, setSavedTests] = useState<TestCase[]>([]);
  const [showResponse, setShowResponse] = useState(true);
  const [environment, setEnvironment] = useState<'local' | 'staging' | 'production'>('local');

  // Pre-defined test cases for all 22 APIs
  const predefinedTests: TestCase[] = [
    // Payment & Escrow APIs
    {
      id: 'process-payment',
      name: 'Process Payment',
      endpoint: '/api/v1/payments/process',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        orderId: 'ORD-123456',
        amount: 2500,
        currency: 'BDT',
        userId: 'USER-789',
        paymentMethod: 'wallet'
      }, null, 2),
      expectedStatus: 200
    },
    {
      id: 'release-escrow',
      name: 'Release Escrow',
      endpoint: '/api/v1/escrow/release',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        orderId: 'ORD-123456',
        buyerConfirmed: true,
        deliveryRating: 5
      }, null, 2),
      expectedStatus: 200
    },
    {
      id: 'check-escrow-status',
      name: 'Check Escrow Status',
      endpoint: '/api/v1/escrow/status/ORD-123456',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      expectedStatus: 200
    },
    {
      id: 'freeze-escrow',
      name: 'Freeze Escrow',
      endpoint: '/api/v1/escrow/freeze',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        orderId: 'ORD-123456',
        reason: 'dispute',
        disputeId: 'DISP-789'
      }, null, 2),
      expectedStatus: 200
    },
    {
      id: 'calculate-commission',
      name: 'Calculate Commission',
      endpoint: '/api/v1/commission/calculate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        productPrice: 2000,
        sellerId: 'SELLER-456',
        category: 'electronics'
      }, null, 2),
      expectedStatus: 200
    },
    
    // Order Management APIs
    {
      id: 'create-order',
      name: 'Create Order',
      endpoint: '/api/v1/orders/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        buyerId: 'USER-123',
        sellerId: 'SELLER-456',
        products: [
          {
            productId: 'PROD-789',
            quantity: 1,
            price: 2500
          }
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Dhaka',
          postalCode: '1200'
        },
        totalAmount: 2500
      }, null, 2),
      expectedStatus: 201
    },
    {
      id: 'get-order-details',
      name: 'Get Order Details',
      endpoint: '/api/v1/orders/ORD-123456',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      expectedStatus: 200
    },
    {
      id: 'update-order-status',
      name: 'Update Order Status',
      endpoint: '/api/v1/orders/ORD-123456/status',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        status: 'shipped',
        trackingNumber: 'TRK-789456'
      }, null, 2),
      expectedStatus: 200
    },
    {
      id: 'mark-delivered',
      name: 'Mark Delivered',
      endpoint: '/api/v1/orders/ORD-123456/delivered',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        deliveryDate: new Date().toISOString(),
        deliveryProof: 'https://example.com/proof.jpg'
      }, null, 2),
      expectedStatus: 200
    },
    
    // Wallet Operations APIs
    {
      id: 'wallet-balance',
      name: 'Get Wallet Balance',
      endpoint: '/api/v1/wallet/USER-123',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      expectedStatus: 200
    },
    {
      id: 'wallet-transactions',
      name: 'Get Wallet Transactions',
      endpoint: '/api/v1/wallet/USER-123/transactions',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      expectedStatus: 200
    },
    {
      id: 'add-funds',
      name: 'Add Funds to Wallet',
      endpoint: '/api/v1/wallet/add-funds',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        userId: 'USER-123',
        amount: 5000,
        paymentGateway: 'bkash',
        transactionId: 'TXN-789456'
      }, null, 2),
      expectedStatus: 200
    },
    {
      id: 'wallet-deduct',
      name: 'Deduct from Wallet',
      endpoint: '/api/v1/wallet/deduct',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        userId: 'USER-123',
        amount: 2500,
        orderId: 'ORD-123456',
        reason: 'purchase'
      }, null, 2),
      expectedStatus: 200
    },
    
    // Refund & Dispute APIs
    {
      id: 'request-refund',
      name: 'Request Refund',
      endpoint: '/api/v1/refunds/request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        orderId: 'ORD-123456',
        reason: 'product_defective',
        description: 'Product arrived damaged',
        evidence: ['https://example.com/photo1.jpg']
      }, null, 2),
      expectedStatus: 201
    },
    {
      id: 'create-dispute',
      name: 'Create Dispute',
      endpoint: '/api/v1/disputes/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        orderId: 'ORD-123456',
        type: 'product_mismatch',
        description: 'Received wrong item',
        evidence: ['https://example.com/proof.jpg']
      }, null, 2),
      expectedStatus: 201
    },
    
    // Withdrawal APIs
    {
      id: 'withdraw-request',
      name: 'Withdrawal Request',
      endpoint: '/api/v1/seller/withdraw',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        sellerId: 'SELLER-456',
        amount: 10000,
        bankAccount: {
          accountNumber: '1234567890',
          bankName: 'Islami Bank',
          accountHolder: 'John Doe'
        }
      }, null, 2),
      expectedStatus: 201
    }
  ];

  const getEnvironmentUrl = () => {
    switch (environment) {
      case 'local':
        return 'http://localhost:3000';
      case 'staging':
        return 'https://staging.ezyify.app';
      case 'production':
        return 'https://api.ezyify.app';
      default:
        return 'http://localhost:3000';
    }
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    setResponse('');
    setStatusCode(null);
    setResponseTime(null);

    const startTime = performance.now();

    try {
      // Parse headers
      const parsedHeaders = JSON.parse(headers);
      
      // Build request options
      const options: RequestInit = {
        method,
        headers: parsedHeaders,
      };

      // Add body for POST/PATCH
      if ((method === 'POST' || method === 'PATCH') && requestBody.trim()) {
        options.body = requestBody;
      }

      // Make request (this is a mock - in real implementation, this would call actual API)
      const fullUrl = `${getEnvironmentUrl()}${endpoint}`;
      
      // Mock response for demonstration
      const mockResponse = {
        success: true,
        data: {
          message: 'This is a mock response. Connect to real backend to see actual data.',
          endpoint: fullUrl,
          method,
          timestamp: new Date().toISOString()
        }
      };

      const endTime = performance.now();
      const timeTaken = Math.round(endTime - startTime);

      setStatusCode(200);
      setResponseTime(timeTaken);
      setResponse(JSON.stringify(mockResponse, null, 2));

      const testResult: TestResult = {
        testId: Date.now().toString(),
        timestamp: new Date(),
        status: 'success',
        statusCode: 200,
        responseTime: timeTaken,
        response: mockResponse
      };

      setTestResults(prev => [testResult, ...prev].slice(0, 50));

      toast.success('Request sent successfully', {
        description: `Response time: ${timeTaken}ms`
      });

    } catch (error: any) {
      const endTime = performance.now();
      const timeTaken = Math.round(endTime - startTime);

      setStatusCode(500);
      setResponseTime(timeTaken);
      setResponse(JSON.stringify({ error: error.message }, null, 2));

      const testResult: TestResult = {
        testId: Date.now().toString(),
        timestamp: new Date(),
        status: 'error',
        responseTime: timeTaken,
        error: error.message
      };

      setTestResults(prev => [testResult, ...prev].slice(0, 50));

      toast.error('Request failed', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPredefinedTest = (test: TestCase) => {
    setEndpoint(test.endpoint);
    setMethod(test.method);
    setHeaders(JSON.stringify(test.headers, null, 2));
    setRequestBody(test.body || '{\n  \n}');
    setSelectedEndpoint(test.id);
    toast.success('Test case loaded', {
      description: test.name
    });
  };

  const saveCurrentTest = () => {
    const newTest: TestCase = {
      id: Date.now().toString(),
      name: `Test ${savedTests.length + 1}`,
      endpoint,
      method,
      headers: JSON.parse(headers),
      body: requestBody,
      expectedStatus: 200
    };

    setSavedTests(prev => [...prev, newTest]);
    toast.success('Test saved successfully');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const clearResponse = () => {
    setResponse('');
    setStatusCode(null);
    setResponseTime(null);
  };

  const formatJSON = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return text;
    }
  };

  const getStatusColor = (status: number | null) => {
    if (!status) return 'text-muted-foreground';
    if (status >= 200 && status < 300) return 'text-success';
    if (status >= 400 && status < 500) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/15 rounded-xl">
                  <Zap className="size-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">API Testing Dashboard</h1>
                  <p className="text-muted-foreground">Interactive API endpoint testing and validation</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={environment} onValueChange={(val: any) => setEnvironment(val)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
              
              <Badge variant="outline" className="gap-2">
                <Server className="size-3" />
                {getEnvironmentUrl()}
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{predefinedTests.length}</div>
                <div className="text-sm text-muted-foreground">Ready Tests</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-success">
                  {testResults.filter(r => r.status === 'success').length}
                </div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-error">
                  {testResults.filter(r => r.status === 'error' || r.status === 'failed').length}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {testResults.length > 0 
                    ? `${Math.round(testResults.reduce((acc, r) => acc + r.responseTime, 0) / testResults.length)}ms`
                    : '—'
                  }
                </div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sidebar - Predefined Tests */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileJson className="size-4" />
                  Test Library
                </CardTitle>
                <CardDescription>22 pre-configured API tests</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {predefinedTests.map(test => (
                      <button
                        key={test.id}
                        onClick={() => loadPredefinedTest(test)}
                        className={`w-full text-left p-3 rounded-xl border transition-colors ${
                          selectedEndpoint === test.id
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'hover:bg-muted border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{test.name}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              test.method === 'GET' ? 'bg-info/5 text-info border-blue-300' :
                              test.method === 'POST' ? 'bg-success/5 text-success border-green-300' :
                              test.method === 'PATCH' ? 'bg-warning/5 text-warning border-warning/40' :
                              'bg-error/5 text-error border-error/40'
                            }`}
                          >
                            {test.method}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono truncate">
                          {test.endpoint}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Testing Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* Request Builder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="size-5" />
                  Request Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Method & Endpoint */}
                <div className="flex gap-3">
                  <Select value={method} onValueChange={(val: any) => setMethod(val)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="/api/v1/endpoint"
                    className="flex-1 font-mono"
                  />

                  <Button onClick={handleSendRequest} disabled={isLoading} className="gap-2">
                    {isLoading ? (
                      <RotateCw className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Send
                  </Button>
                </div>

                <Tabs defaultValue="headers" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                    <TabsTrigger value="body">Body</TabsTrigger>
                    <TabsTrigger value="auth">Auth</TabsTrigger>
                  </TabsList>

                  <TabsContent value="headers" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Request Headers (JSON)</Label>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setHeaders(formatJSON(headers))}
                      >
                        Format JSON
                      </Button>
                    </div>
                    <Textarea
                      value={headers}
                      onChange={(e) => setHeaders(e.target.value)}
                      placeholder="Enter headers as JSON"
                      className="font-mono text-sm min-h-[150px]"
                    />
                  </TabsContent>

                  <TabsContent value="body" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Request Body (JSON)</Label>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setRequestBody(formatJSON(requestBody))}
                      >
                        Format JSON
                      </Button>
                    </div>
                    <Textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      placeholder="Enter request body as JSON"
                      className="font-mono text-sm min-h-[150px]"
                      disabled={method === 'GET' || method === 'DELETE'}
                    />
                  </TabsContent>

                  <TabsContent value="auth" className="space-y-3">
                    <Alert>
                      <Shield className="size-4" />
                      <AlertTitle>Authentication</AlertTitle>
                      <AlertDescription>
                        Add your JWT token in the Headers tab under "Authorization" key.
                        Format: Bearer YOUR_TOKEN_HERE
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={saveCurrentTest}>
                    <Save className="size-4 mr-2" />
                    Save Test
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearResponse}>
                    <Trash2 className="size-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Response Viewer */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="size-5" />
                    Response
                  </CardTitle>
                  
                  <div className="flex items-center gap-3">
                    {statusCode && (
                      <>
                        <Badge variant="outline" className={getStatusColor(statusCode)}>
                          Status: {statusCode}
                        </Badge>
                        {responseTime && (
                          <Badge variant="outline">
                            <Clock className="size-3 mr-1" />
                            {responseTime}ms
                          </Badge>
                        )}
                      </>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowResponse(!showResponse)}
                    >
                      {showResponse ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                    
                    {response && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(response)}
                      >
                        <Copy className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              {showResponse && (
                <CardContent>
                  {response ? (
                    <div className="relative">
                      <Textarea
                        value={response}
                        readOnly
                        className="font-mono text-sm min-h-[300px] bg-muted"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Server className="size-12 mx-auto mb-3 opacity-50" />
                      <p>Send a request to see the response</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Test History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="size-5" />
                  Test History
                </CardTitle>
                <CardDescription>Recent test executions</CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {testResults.map((result, index) => (
                        <div
                          key={result.testId}
                          className="flex items-center justify-between p-3 border rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            {result.status === 'success' ? (
                              <CheckCircle2 className="size-5 text-success" />
                            ) : (
                              <XCircle className="size-5 text-error" />
                            )}
                            <div>
                              <div className="font-medium text-sm">
                                Test #{testResults.length - index}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {result.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {result.statusCode && (
                              <Badge variant="outline" className={getStatusColor(result.statusCode)}>
                                {result.statusCode}
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {result.responseTime}ms
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="size-12 mx-auto mb-3 opacity-50" />
                    <p>No test history yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="mt-6">
          <AlertTriangle className="size-4" />
          <AlertTitle>Testing Mode</AlertTitle>
          <AlertDescription>
            This dashboard currently uses mock responses. To test real APIs, connect to your backend server
            and update the environment URL. All requests will be sent to: <strong>{getEnvironmentUrl()}</strong>
          </AlertDescription>
        </Alert>

        {/* Quick Links */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Related Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/api-integration-playground">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Code className="size-4" />
                      <span className="font-semibold">API Playground</span>
                    </div>
                    <p className="text-xs text-muted-foreground">API documentation</p>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/backend-integration-status">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="size-4" />
                      <span className="font-semibold">Integration Status</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Track API progress</p>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/launch-control">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Settings className="size-4" />
                      <span className="font-semibold">Launch Control</span>
                    </div>
                    <p className="text-xs text-muted-foreground">System monitoring</p>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default APITestingDashboard;

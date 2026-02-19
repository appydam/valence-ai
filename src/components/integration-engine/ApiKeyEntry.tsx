import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type AuthType = "api_key" | "bearer_token" | "basic_auth";

interface ApiKeyEntryProps {
  authType: AuthType;
  onSubmit: (credentials: string) => Promise<void>;
  isLoading: boolean;
}

export function ApiKeyEntry({ authType, onSubmit, isLoading }: ApiKeyEntryProps) {
  const [apiKey, setApiKey] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (authType === "basic_auth") {
      // For basic auth, combine username:password
      const credentials = `${username}:${password}`;
      await onSubmit(credentials);
    } else {
      // For API key or bearer token
      await onSubmit(apiKey);
    }
  };

  const isValid = authType === "basic_auth"
    ? username && password
    : apiKey.length > 0;

  return (
    <div className="space-y-4">
      {authType === "basic_auth" ? (
        <>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
            />
          </div>
        </>
      ) : (
        <div>
          <Label htmlFor="apiKey">
            {authType === "bearer_token" ? "Bearer Token" : "API Key"}
          </Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={
              authType === "bearer_token"
                ? "Enter your bearer token"
                : "Enter your API key"
            }
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your credentials are encrypted and stored securely
          </p>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!isValid || isLoading}
        className="w-full"
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isLoading ? "Connecting..." : "Connect"}
      </Button>
    </div>
  );
}

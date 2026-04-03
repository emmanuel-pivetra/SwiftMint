clc; clear;
A = 5.485e-3;  B = 6.65e-6;  C = 2.805e-11;  D = -2e-17;

f  = @(T) A*T + B*T.^2 + C*T.^4 + D*T.^6 - 2;
fp = @(T) A + 2*B*T + 4*C*T.^3 + 6*D*T.^5;

T = 260;  
tol = 1e-6;  
maxit = 100;

for k = 1:maxit
    Tnew = T - f(T)/fp(T);
    if abs(Tnew - T) < tol
        break;
    end
    T = Tnew;
end

fprintf('Temperature = %.10f deg C\n', Tnew);
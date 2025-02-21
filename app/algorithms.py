import torch

class Algorithms:
    @staticmethod
    def cgne(H, image, max_iter=1000, tol=1e-4):
        signal_length = 50816 if image.size == 60 else 27904

        ht = H.T
        g = torch.tensor(image.signal[:signal_length], dtype=torch.float32).unsqueeze(0)
        f = torch.zeros(H.shape[1], 1, dtype=H.dtype)
        r = g - torch.matmul(H, f)
        p = torch.matmul(ht, r)
        rs_old = torch.matmul(r.T, r)

        for i in range(max_iter):
            Hp = torch.matmul(H, p)
            alpha = rs_old / torch.matmul(p.T, p)
            f = f + alpha * p
            r = r - alpha * Hp
            rs_new = torch.matmul(r.T, r)

            if torch.sqrt(rs_new) < tol:
                print(f"Convergence after {i+1} iterations.")
                break

            beta = rs_new / rs_old
            p = torch.matmul(ht, r) + beta * p
            rs_old = rs_new

        return f, i

    @staticmethod
    def cgnr(H, image, max_iter=1000, tol=1e-4):
        signal_length = 50816 if image.size == 60 else 27904

        ht = H.T
        f = torch.zeros(H.shape[1], dtype=torch.float32)
        g = torch.tensor(image.signal[:signal_length], dtype=torch.float32)
        r = g - torch.matmul(H, f)
        z = torch.matmul(ht, r)
        p = z
        rz_old = torch.matmul(z.T, z)

        for i in range(max_iter):
            Hp = torch.matmul(H, p)
            alpha = rz_old / torch.matmul(Hp.T, Hp)
            f = f + alpha * p
            r = r - alpha * Hp
            z = torch.matmul(ht, r)
            rz_new = torch.matmul(z.T, z)

            if torch.sqrt(rz_new) < tol:
                print(f"Convergence after {i+1} iterations.")
                break

            beta = rz_new / rz_old
            p = z + beta * p
            rz_old = rz_new

        return f, i

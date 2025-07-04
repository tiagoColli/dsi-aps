import torch

class Algorithms:
    @staticmethod
    def cgne(H, g, max_iter=1000, tol=1e-4):
        """
        CGNE (Conjugate Gradient Normal Error) algorithm.
        :param H: Model matrix (torch.Tensor of shape [m, n])
        :param g: Signal vector (torch.Tensor of shape [m, 1])
        :return: Reconstructed image (f) as a PyTorch tensor, and number of iterations
        """
        Ht = H.T
        f = torch.zeros(H.shape[1], 1, dtype=H.dtype, device=H.device)
        r = g - torch.matmul(H, f)
        z = torch.matmul(Ht, r)
        p = z

        for i in range(max_iter):
            Hp = torch.matmul(H, p)
            alpha = torch.matmul(z.T, z) / torch.matmul(Hp.T, Hp)
            f = f + alpha * p
            r_next = r - alpha * Hp
            z_next = torch.matmul(Ht, r_next)

            error = abs(torch.norm(r, 2).item() - torch.norm(r_next, 2).item())
            if error < tol:
                num_iterations = i
                break

            beta = torch.matmul(z_next.T, z_next) / torch.matmul(z.T, z)
            p = z_next + beta * p
            r = r_next
            z = z_next
        else:
            num_iterations = max_iter

        print("Processing finished.")
        return f, num_iterations

    @staticmethod
    def cgnr(H, g, max_iter=1000, tol=1e-4):
        """
        CGNR (Conjugate Gradient Normal Residual) algorithm.
        :param H: Model matrix (torch.Tensor of shape [m, n])
        :param g: Signal vector (torch.Tensor of shape [m, 1])
        :return: Reconstructed image (f) as a PyTorch tensor, and number of iterations
        """
        Ht = H.T
        f = torch.zeros(H.shape[1], 1, dtype=H.dtype, device=H.device)
        r = g - torch.matmul(H, f)
        z = torch.matmul(Ht, r)
        p = z

        for i in range(max_iter):
            w = torch.matmul(H, p)
            alpha = torch.matmul(z.T, z) / torch.matmul(w.T, w)
            f = f + alpha * p
            r_next = r - alpha * w
            z_next = torch.matmul(Ht, r_next)

            error = abs(torch.norm(r, 2).item() - torch.norm(r_next, 2).item())
            if error < tol:
                num_iterations = i
                break

            beta = torch.matmul(z_next.T, z_next) / torch.matmul(z.T, z)
            p = z_next + beta * p
            r = r_next
            z = z_next
        else:
            num_iterations = max_iter

        print('CGNR algorithm finished.')
        return f, num_iterations

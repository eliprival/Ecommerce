const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const STATIC_DIR = __dirname;

app.use(express.json());
app.use(express.static(STATIC_DIR));

async function ensureUsersFile() {
    try {
        await fs.access(USERS_FILE);
    } catch (error) {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(USERS_FILE, '[]', 'utf8');
    }
}

async function ensureLeadsFile() {
    try {
        await fs.access(LEADS_FILE);
    } catch (error) {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(LEADS_FILE, '[]', 'utf8');
    }
}

async function readUsers() {
    await ensureUsersFile();
    const raw = await fs.readFile(USERS_FILE, 'utf8');
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

async function writeUsers(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 4), 'utf8');
}

async function readLeads() {
    await ensureLeadsFile();
    const raw = await fs.readFile(LEADS_FILE, 'utf8');
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

async function writeLeads(leads) {
    await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 4), 'utf8');
}

app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(name).trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({ message: 'Ingresa un correo electrónico válido.' });
    }

    if (String(password).length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        const users = await readUsers();
        const existingUser = users.find((user) => user.email === normalizedEmail);

        if (existingUser) {
            return res.status(409).json({ message: 'Este correo ya está registrado. Inicia sesión en su lugar.' });
        }

        const passwordHash = await bcrypt.hash(String(password), 10);
        const confirmationToken = crypto.randomBytes(24).toString('hex');
        const confirmationLink = `${req.protocol}://${req.get('host')}/confirmar-correo/${confirmationToken}`;

        const newUser = {
            id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'),
            name: trimmedName,
            email: normalizedEmail,
            passwordHash,
            createdAt: new Date().toISOString(),
            emailConfirmed: false,
            confirmationToken,
            pendingEmail: {
                subject: 'Bienvenido a La Botica',
                body: `Hola ${trimmedName}, confirma tu correo visitando este enlace: ${confirmationLink}`,
                confirmationLink,
            },
        };

        users.push(newUser);
        await writeUsers(users);

        return res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente. Revisa tu correo para confirmar la cuenta.',
            pendingEmail: newUser.pendingEmail,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'No pudimos procesar tu registro. Intenta nuevamente.' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ message: 'Debes ingresar correo y contraseña.' });
    }

    try {
        const users = await readUsers();
        const normalizedEmail = String(email).trim().toLowerCase();
        const user = users.find((candidate) => candidate.email === normalizedEmail);

        if (!user) {
            return res.status(401).json({ message: 'Credenciales no válidas.' });
        }

        const passwordMatch = await bcrypt.compare(String(password), user.passwordHash);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciales no válidas.' });
        }

        const responseUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            emailConfirmed: user.emailConfirmed,
        };

        return res.json({
            success: true,
            message: user.emailConfirmed
                ? `¡Hola de nuevo, ${user.name}!`
                : 'Inicio de sesión exitoso. Recuerda confirmar tu correo para completar tu registro.',
            user: responseUser,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'No pudimos validar tus credenciales. Intenta más tarde.' });
    }
});

app.post('/api/newsletter', async (req, res) => {
    const { email } = req.body || {};

    if (!email) {
        return res.status(400).json({ message: 'El correo es obligatorio.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({ message: 'Ingresa un correo válido.' });
    }

    try {
        const leads = await readLeads();
        let lead = leads.find((entry) => entry.email === normalizedEmail);
        let discountCode = lead?.discountCode;

        if (!lead) {
            discountCode = `BOTICA5-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
            lead = {
                id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'),
                email: normalizedEmail,
                discountCode,
                subscribedAt: new Date().toISOString(),
            };
            leads.push(lead);
        } else {
            lead.lastRequestedAt = new Date().toISOString();
            if (!lead.discountCode) {
                discountCode = `BOTICA5-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
                lead.discountCode = discountCode;
            }
        }

        await writeLeads(leads);

        return res.json({
            success: true,
            code: discountCode,
            message: '¡Gracias por unirte! Enviamos tu código a tu correo.',
            pendingEmail: {
                subject: 'Tu código exclusivo de La Botica',
                body: `Gracias por unirte a nuestras novedades. Usa el código ${discountCode} para obtener 5% de descuento en tu primera compra.`,
                discountCode,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'No pudimos guardar tu correo. Intenta más tarde.' });
    }
});

app.get('/confirmar-correo/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const users = await readUsers();
        const user = users.find((candidate) => candidate.confirmationToken === token);

        if (!user) {
            return res.status(404).send('<h1>Enlace inválido</h1><p>El enlace de confirmación no es válido o ya fue usado.</p>');
        }

        user.emailConfirmed = true;
        user.confirmationToken = null;
        await writeUsers(users);

        res.send('<h1>Correo confirmado</h1><p>Gracias por confirmar tu dirección de correo. Ahora puedes cerrar esta pestaña.</p>');
    } catch (error) {
        console.error(error);
        res.status(500).send('<h1>Error</h1><p>No pudimos confirmar tu correo en este momento.</p>');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});


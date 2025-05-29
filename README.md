# Free Invoice Generator

<a href="https://www.producthunt.com/posts/invoice-generator-9bce3e1b-dab2-4a7a-ba7e-e315be868119?utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-invoice&#0045;generator&#0045;9bce3e1b&#0045;dab2&#0045;4a7a&#0045;ba7e&#0045;e315be868119" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=453378&theme=light&period=daily" alt="Invoice&#0032;Generator - Get&#0032;paid&#0032;faster&#0032;with&#0032;free&#0032;invoice&#0032;generator | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

This project provides a user-friendly invoice generation tool for freelancers, small businesses, and contractors. Create professional, customized invoices quickly and easily to ensure you get paid on time, every time.

## ⛰️ Preview

![806shots_so](https://github.com/pranavp10/invoice-generator/assets/49075129/403cffa1-b540-4d62-a9bd-c3c216802fe1)

## Key Features

- **Free & Open Source:** Absolutely no cost, with the freedom to customize and adapt to your specific needs.
- **Fast & Efficient:** Generate beautiful invoices in seconds by simply filling in the blanks.
- **Unlimited Invoices:** Create as many invoices as you require, forever, at no charge.
- **Save Time & Resources:** Eliminate the need for manual invoice creation with spreadsheets and expensive software.

## 🤝 Contributing

### Technologies Used

- **PDF Generator:** [React PDF](https://react-pdf.org/)
- **Framework:** [Next.js](https://nextjs.org)
- **Styling:** [Tailwind CSS](http://tailwindcss.com)

### 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/borecz/invoice-generator.git
cd invoice-generator
npm install

# Install Supabase CLI (if not already installed)
npm install -g supabase

# Start development environment
npm run dev
```

That's it! The development server will start at http://localhost:3001 with a local database.

### 📚 Development Workflow

This project follows a comprehensive development workflow with:

- **Local-First Development**: Always use local Supabase for development
- **Comprehensive Testing**: Unit tests (Vitest) + E2E tests (Playwright)
- **Environment Management**: Easy switching between local/remote databases
- **Database Management**: Automated migrations and seeding

**Key Commands:**

```bash
npm run dev              # Start development (local database)
npm run test:all         # Run all tests
npm run env:status       # Check current environment
npm run db:studio        # Open database dashboard
npm run workflow:validate # Validate setup
```

**Documentation:**

- 📖 [Development Workflow Guide](./docs/DEVELOPMENT-WORKFLOW.md)
- 🚀 [Quick Start Guide](./QUICK-START.md)
- 🧪 [Testing Documentation](./docs/TESTING.md)

[Live Invoice Generator Link](https://invoice-generator.prolab.sh/)

### License

You are free to use this code as inspiration. Please do not copy it directly. Crediting the author is appreciated. Please remove all personal information (images, etc.)

### Support

- **Bug Reports:** To report bugs, create an issue on the project's GitHub repository.
- **Feature Requests:** Feel free to suggest new features by creating an issue on GitHub.

### Star History

[![Star History Chart](https://api.star-history.com/svg?repos=pranavp10/invoice-generator&type=Date)](https://star-history.com/#pranavp10/invoice-generator&Date)

"""Services endpoint - GBRC service catalog."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_services():
    """Return the GBRC service catalog."""
    return {
        "categories": [
            {
                "name": "PacBio Sequencing",
                "description": "Long-read sequencing on the PacBio platform",
                "services": [
                    {"name": "PacBio Library Preparation", "description": "SMRTbell library construction"},
                    {"name": "PacBio SMRTcell Sequencing", "description": "HiFi and CLR sequencing runs"},
                ],
            },
            {
                "name": "Illumina Sequencing",
                "description": "Short-read sequencing on Illumina platforms",
                "services": [
                    {"name": "Illumina Library Preparation", "description": "DNA and RNA library construction"},
                    {"name": "Illumina Sequencing Run", "description": "NextSeq, MiSeq, and NovaSeq runs"},
                ],
            },
            {
                "name": "RNA Sequencing",
                "description": "Transcriptome analysis and gene expression profiling",
                "services": [
                    {"name": "RNA-seq Library Prep", "description": "mRNA and total RNA library construction"},
                    {"name": "Single-cell RNA-seq", "description": "10x Genomics single-cell workflows"},
                ],
            },
            {
                "name": "Bioinformatics",
                "description": "Computational analysis and consultation",
                "services": [
                    {"name": "Standard Analysis", "description": "Alignment, QC, and differential analysis"},
                    {"name": "Custom Consultation", "description": "Project-specific bioinformatics support"},
                ],
            },
            {
                "name": "Sample Preparation",
                "description": "DNA/RNA extraction and quality assessment",
                "services": [
                    {"name": "DNA Isolation", "description": "High-quality genomic DNA extraction"},
                    {"name": "RNA Isolation", "description": "Total RNA extraction with QC"},
                    {"name": "Fragment Analysis", "description": "Size selection and quality assessment"},
                ],
            },
        ]
    }

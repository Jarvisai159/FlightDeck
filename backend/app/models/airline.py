"""Airline model with scraper coverage tracking."""

from sqlalchemy import String, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Airline(Base):
    __tablename__ = "airlines"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    iata_code: Mapped[str | None] = mapped_column(String(3), index=True)
    icao_code: Mapped[str | None] = mapped_column(String(4), index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[str | None] = mapped_column(String(255))
    website: Mapped[str | None] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    # Which platforms cover this airline (for gap analysis)
    covered_by: Mapped[list | None] = mapped_column(JSON)  # e.g. ["kiwi", "skyscanner"]
    not_covered_by: Mapped[list | None] = mapped_column(JSON)  # e.g. ["google_flights"]
    # Whether we have a direct scraper for this airline
    has_direct_scraper: Mapped[bool] = mapped_column(Boolean, default=False)
    region: Mapped[str | None] = mapped_column(String(50))

    def __repr__(self) -> str:
        return f"<Airline {self.iata_code} - {self.name}>"

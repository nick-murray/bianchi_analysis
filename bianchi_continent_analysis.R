# ------------------------------------------------------------------ #
#                                                                    #
# GIC Continent Analyses - Bianchi et al (2023) Nature Geoscience
# Version 2.1.4 of the change data
# Developed from 2.0.8 of the extent data
#                                                                    #                                                                    #
#--------------------------------------------------------------------#



install.packages("geojsonio", "rgdal")
library(geojsonio)
library(rgdal)
library(dplyr)
library (readr)
library(foreign)
# library(tidyr)

setwd ("C:\\_NickMurray\\Murray_Git\\global-intertidal-change-DECRA") # work computer
source("code\\R\\gic_areaAnalysis_funs.R")

# Import eez cw area data
extentDat <- read.dbf("C:\\Dropbox\\Publications\\Published_Papers\\_Submitted\\2021_Tom_Bianchi_Mud_in_Biosphere\\Analysis\\bianchi_Data_v1.dbf", as.is = T)
colnames(extentDat)
head(extentDat)

# _Import:  Country table for Continents / Country Names ####
continents <- read.csv("data/country_ISO/country-and-continent-codes-list-csv.csv", stringsAsFactors = F)
continents$iso.code <- continents$Three_Letter_Country_Code
region <- read.csv("data/country_ISO/UNSD-Methodology.csv", stringsAsFactors = F)
region <- subset(region, select = c(Region.Name, Sub.region.Name, ISO.alpha3.Code))
region$iso.code <- region$ISO.alpha3.Code
iso <- continents %>% full_join(region)
colnames(iso)
# iso %>% filter (Sub.region.Name == "Latin America and the Caribbean")

# total area
extent.summary.dat <- extentDat %>% 
  summarise(
    TOTAL_tw = sum(area_cw_km),
    TOTAL_st_mud = sum (area_stmud)
    )
extent.summary.dat # tw = 354958.76km2, st_mud = 40,362,132km2

# by continent

# CONTINENT
continent.data <- extentDat %>%
  left_join(iso, by = c("ISO_SOV1" = "iso.code")) %>% 
  group_by(Continent_Name) %>%
  summarise(
    TOTAL_tw = sum(area_cw_km),
    TOTAL_st_mud = sum(area_stmud)) %>%
  mutate (pc.total.tidalwetlands = TOTAL_tw / sum(TOTAL_tw) * 100,
          pc.total.subtidalmud = TOTAL_st_mud / sum(TOTAL_st_mud))

continent.data

sum(continent.data$TOTAL)
sum(continent.data$pc.total)
